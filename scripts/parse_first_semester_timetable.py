from pathlib import Path
import json
import re
import unicodedata
import pdfplumber

RAW_DIR = Path("raw_pdf/first_2026_2027")
OUT_DIR = Path("public/data/semesters/first_2026_2027")
CONFIG_OUT = Path("public/data/config.json")

ARABIC_DIGITS_MAP = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")

ARABIC_RE = re.compile(
    r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]"
)
PRESENTATION_FORMS_RE = re.compile(r"[\uFB50-\uFDFF\uFE70-\uFEFF]")
MULTISPACE_RE = re.compile(r"\s+")

COURSE_CODE_RE = re.compile(r"[A-Z]{2,5}\d{3,4}")
TIME_RE = re.compile(r"^\d{1,2}:\d{2}$")

def normalize_text(value):
    """Convert None to empty string, normalize Arabic digits, and trim spaces."""
    if value is None:
        return ""

    text = str(value).translate(ARABIC_DIGITS_MAP)
    text = unicodedata.normalize("NFKC", text)
    text = MULTISPACE_RE.sub(" ", text).strip()

    return text


def contains_arabic(text):
    """Check if text contains Arabic characters."""
    return bool(ARABIC_RE.search(text or ""))


def is_arabic_token(token):
    """Check if a token contains Arabic characters."""
    return bool(ARABIC_RE.search(token or ""))


def normalize_arabic_text(value):
    """
    Convert Arabic PDF-extracted visual-order text into logical-order text.

    In these PDFs Arabic text usually comes like:
    ةیبرعلا ةباتكلا

    We need:
    الكتابة العربية
    """
    raw = normalize_text(value)

    if not raw:
        return ""

    if not contains_arabic(raw):
        return raw

    tokens = raw.split()
    fixed_tokens = []

    for token in tokens:
        if is_arabic_token(token):
            fixed_tokens.append(token[::-1])
        else:
            fixed_tokens.append(token)

    fixed_tokens = fixed_tokens[::-1]

    text = " ".join(fixed_tokens)
    text = MULTISPACE_RE.sub(" ", text).strip()

    text = text.replace(" .", ".")
    text = text.replace("( ", "(").replace(" )", ")")

    return text


def normalize_number(value):
    """Convert numeric-looking values to int/float where possible."""
    text = normalize_text(value)

    if not text:
        return ""

    try:
        num = float(text)
        if num.is_integer():
            return int(num)
        return num
    except ValueError:
        return text
    

def is_number(value):
    """Check if value is numeric."""
    text = normalize_text(value)

    if not text:
        return False

    try:
        float(text)
        return True
    except ValueError:
        return False


def looks_like_time(value):
    """Check if value looks like HH:MM."""
    return bool(TIME_RE.match(normalize_text(value)))


def extract_course_code(value):
    """
    Extract course code from a cell.

    Some rows contain values like:
    MATH001 1

    We only need:
    MATH001
    """
    text = normalize_text(value)
    match = COURSE_CODE_RE.search(text)

    if not match:
        return ""

    return match.group(0)


def pick_instructor(row):
    """
    Pick instructor from the new wide-table format.

    In boys PDF instructor is usually column 6.
    In girls PDF instructor sometimes appears in column 5 because the level column is empty/misaligned.
    """
    possible_indexes = [6, 5]

    for index in possible_indexes:
        value = get_cell(row, index)

        if value and contains_arabic(value) and not is_number(value):
            return value

    return ""


def canonical_header(value):
    """
    Normalize header text for matching.

    Arabic headers may have Alef variants, spaces, or small formatting differences.
    """
    text = normalize_arabic_text(value)
    text = text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    text = text.replace("ى", "ي")
    text = text.replace("ة", "ه")
    text = re.sub(r"[^\w\u0600-\u06FF]", "", text)
    text = text.lower().strip()

    return text


def find_pdf_by_keywords(keywords):
    """
    Find one PDF in RAW_DIR by filename keywords.
    Example: boys.pdf -> males, girls.pdf -> females.
    """
    pdf_files = list(RAW_DIR.glob("*.pdf"))

    matches = [
        p for p in pdf_files
        if any(keyword.lower() in p.name.lower() for keyword in keywords)
    ]

    if not matches:
        raise FileNotFoundError(
            f"No PDF found in {RAW_DIR} for keywords: {', '.join(keywords)}"
        )

    if len(matches) > 1:
        raise RuntimeError(
            f"Expected one PDF for {keywords}, found {len(matches)}: "
            + ", ".join(p.name for p in matches)
        )

    return matches[0]


def detect_header_map(row):
    """
    Detect the first-semester wide-table header.

    After NFKC normalization the extracted visual Arabic header looks like:
    ةبعشلا, ررقملا, 1عون
    """
    joined = " ".join(normalize_text(cell) for cell in row if cell)

    has_section = "ةبعشلا" in joined
    has_course = "ررقملا" in joined
    has_meeting = "1عون" in joined

    if not (has_section and has_course and has_meeting):
        return None

    return {
        "section": 0,
        "course_code": 1,
        "course_name": 2,
        "credits": 3,
        "instructor": 6,
        "meetings": {
            "1": {
                "type": 13,
                "days": 14,
                "time_start": 15,
                "time_end": 16,
                "location": 17,
            },
            "2": {
                "type": 18,
                "days": 19,
                "time_start": 20,
                "time_end": 21,
                "location": 22,
            },
            "3": {
                "type": 23,
                "days": 24,
                "time_start": 25,
                "time_end": 26,
                "location": 27,
            },
        },
    }


def get_cell(row, index):
    """Safely read a normalized cell by index."""
    if index is None or index >= len(row):
        return ""

    return normalize_text(row[index])


def debug_page_rows(page_index, tables):
    """Print a small preview of extracted rows for pages with zero records."""
    print(f"\nDEBUG page {page_index}: tables={len(tables or [])}")

    for table_index, table in enumerate(tables or [], start=1):
        print(f"DEBUG table {table_index}: rows={len(table or [])}")

        for row_index, row in enumerate((table or [])[:5], start=1):
            cleaned = [normalize_text(cell) for cell in row]
            print(f"DEBUG row {row_index}: len={len(cleaned)}")
            print(cleaned)


def looks_like_course_code(value):
    """Check if a value contains a course code."""
    return bool(extract_course_code(value))


def build_records_from_wide_row(row, header_map):
    """
    Convert one wide table row into one or more flat timetable records.

    Output shape must stay compatible with repo.js:
    section, course_code, course_name, credits, days, time_start, time_end,
    location, instructor.
    """
    section = get_cell(row, header_map.get("section"))
    course_code_raw = get_cell(row, header_map.get("course_code"))
    course_code = extract_course_code(course_code_raw)
    course_name = get_cell(row, header_map.get("course_name"))
    credits = get_cell(row, header_map.get("credits"))
    instructor = get_cell(row, header_map.get("instructor")) or pick_instructor(row)

    if not section or not looks_like_course_code(course_code):
        return []

    if not course_name:
        return []

    records = []

    for meeting_num in sorted(header_map["meetings"].keys(), key=lambda n: int(n)):
        meeting = header_map["meetings"][meeting_num]

        days = get_cell(row, meeting.get("days"))
        time_start = get_cell(row, meeting.get("time_start"))
        time_end = get_cell(row, meeting.get("time_end"))
        location = get_cell(row, meeting.get("location"))

        # Skip empty meeting blocks.
        if not days and not time_start and not time_end and not location:
            continue

        # Skip broken/non-schedule blocks.
        if not days or not looks_like_time(time_start) or not looks_like_time(time_end):
            continue

        records.append(
            {
                "section": normalize_number(section),
                "course_code": course_code,
                "course_name": normalize_arabic_text(course_name),
                "credits": normalize_number(credits) if credits else 0,
                "days": days,
                "time_start": time_start,
                "time_end": time_end,
                "location": normalize_arabic_text(location),
                "instructor": normalize_arabic_text(instructor),
            }
        )

    return records


def extract_wide_records_from_pdf(pdf_path):
    """
    Extract records from the new first-semester wide-table PDF.

    The header is usually available only on the first page.
    After it is detected once, we reuse the same column map for all next pages.
    """
    records = []
    pages_without_header = []

    with pdfplumber.open(pdf_path) as pdf:
        header_map = None

        for page_index, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()
            page_records_count = 0

            for table in tables or []:
                if not table:
                    continue

                for row in table:
                    if not row:
                        continue

                    cleaned = [normalize_text(cell) for cell in row]

                    if not any(cleaned):
                        continue

                    # Try to detect the header when it exists.
                    # In this PDF format it is normally present only on page 1.
                    maybe_header = detect_header_map(cleaned)

                    if maybe_header:
                        header_map = maybe_header
                        print(f"Page {page_index}: header detected")
                        continue

                    # If header was not detected yet, we cannot safely parse rows.
                    if not header_map:
                        continue

                    row_records = build_records_from_wide_row(cleaned, header_map)

                    if row_records:
                        records.extend(row_records)
                        page_records_count += len(row_records)

            # Only warn if we still do not have header_map at all.
            # Do not warn for page 2+ if we already detected header on page 1.
            if not header_map:
                pages_without_header.append(page_index)

            if page_records_count == 0:
                debug_page_rows(page_index, tables)

            print(f"Page {page_index}: extracted_rows={page_records_count}")

    return records, pages_without_header


def write_json(path, data):
    """Write JSON using UTF-8 and readable indentation."""
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)


def ensure_config_exists():
    """Create shared config file only if it does not exist yet."""
    if CONFIG_OUT.exists():
        return

    CONFIG_OUT.parent.mkdir(parents=True, exist_ok=True)

    write_json(
        CONFIG_OUT,
        {
            "price_per_credit": 0,
            "default_scholarship_pct": 0,
        },
    )


def main():
    """Main entry point for first semester parser."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    males_pdf = find_pdf_by_keywords(["boys", "boy", "male"])
    females_pdf = find_pdf_by_keywords(["girls", "girl", "female"])

    print(f"Parsing male PDF: {males_pdf.name}")
    male_records, male_pages_without_header = extract_wide_records_from_pdf(males_pdf)

    print(f"\nParsing female PDF: {females_pdf.name}")
    female_records, female_pages_without_header = extract_wide_records_from_pdf(females_pdf)

    males_out = OUT_DIR / "males_timetable.json"
    females_out = OUT_DIR / "females_timetable.json"

    write_json(males_out, male_records)
    write_json(females_out, female_records)

    ensure_config_exists()

    print("\nDone.")
    print(f"Male rows: {len(male_records)}")
    print(f"Female rows: {len(female_records)}")
    print(f"Saved: {males_out}")
    print(f"Saved: {females_out}")
    print(f"Config: {CONFIG_OUT}")

    if male_pages_without_header:
        print(
            "Warning: male pages without detected header: "
            + ", ".join(map(str, male_pages_without_header))
        )

    if female_pages_without_header:
        print(
            "Warning: female pages without detected header: "
            + ", ".join(map(str, female_pages_without_header))
        )


if __name__ == "__main__":
    main()