from pathlib import Path
import json
import re
import unicodedata
import pdfplumber

RAW_DIR = Path("raw_pdf")
OUT_DIR = Path("public/data")

# These strings are used only as helper markers.
# In extracted Arabic PDF text, glyph forms may differ,
# so detection below also checks presentation-form variants.
MALE_HEADER = "مقر الطلاب"
FEMALE_HEADER = "مقر الطالبات"

ARABIC_DIGITS_MAP = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")

PRESENTATION_FORMS_RE = re.compile(r"[\uFB50-\uFDFF\uFE70-\uFEFF]")
ARABIC_RE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]")
MULTISPACE_RE = re.compile(r"\s+")

def is_arabic_token(token: str) -> bool:
    return bool(ARABIC_RE.search(token))

def normalize_text(value):
    """Convert None to empty string, normalize Arabic digits, and trim spaces."""
    if value is None:
        return ""
    return str(value).translate(ARABIC_DIGITS_MAP).strip()

def normalize_arabic_text(value):
    """
    Convert Arabic PDF-extracted visual-order text into logical-order text.

    Strategy:
    - Leave plain Latin / numeric strings unchanged.
    - For Arabic text:
      1) split into tokens
      2) reverse characters inside Arabic tokens
      3) normalize presentation forms with NFKC
      4) reverse token order
    """
    if value is None:
        return ""

    raw = str(value).strip()
    if not raw:
        return ""

    # Fast exit for clearly non-Arabic values like room codes
    if not ARABIC_RE.search(raw):
        return MULTISPACE_RE.sub(" ", raw).strip()

    tokens = raw.split()

    fixed_tokens = []
    for token in tokens:
        if is_arabic_token(token):
            reversed_token = token[::-1]
            normalized_token = unicodedata.normalize("NFKC", reversed_token)
            fixed_tokens.append(normalized_token)
        else:
            fixed_tokens.append(token)

    # Reverse token order for Arabic phrases extracted in visual order
    fixed_tokens = fixed_tokens[::-1]

    text = " ".join(fixed_tokens)
    text = MULTISPACE_RE.sub(" ", text).strip()

    # Small punctuation cleanup
    text = text.replace(" .", ".")
    text = text.replace("( ", "(").replace(" )", ")")

    return text

def find_single_pdf(raw_dir: Path) -> Path:
    """
    Find exactly one PDF file inside raw_pdf/.
    The filename can be anything, but there must be only one PDF.
    """
    pdf_files = list(raw_dir.glob("*.pdf"))
    if not pdf_files:
        raise FileNotFoundError("No PDF file found in raw_pdf/")
    if len(pdf_files) > 1:
        raise RuntimeError(
            f"Expected exactly one PDF in raw_pdf/, found {len(pdf_files)} files: "
            + ", ".join(p.name for p in pdf_files)
        )
    return pdf_files[0]


def detect_gender_from_text(page_text: str):
    """
    Detect page gender from page text.

    Important:
    Arabic text extracted from PDFs may come back in presentation glyph forms,
    so we check both the normal words and the extracted glyph variants.
    """
    text = normalize_text(page_text)
    text = re.sub(r"\s+", " ", text)

    female_markers = [
        FEMALE_HEADER,
        "الطالبات",
        "ﺕﺎﺒﻟﺎﻄﻟﺍ",
    ]

    male_markers = [
        MALE_HEADER,
        "الطلاب",
        "ﺏﻼﻄﻟﺍ",
    ]

    if any(marker in text for marker in female_markers):
        return "F"

    if any(marker in text for marker in male_markers):
        return "M"

    return None


def clean_cell(cell):
    """Normalize a single cell value and collapse multiple spaces."""
    text = normalize_text(cell)
    text = re.sub(r"\s+", " ", text)
    return text


def normalize_number(value):
    """
    Convert values like '29.0' to 29, keep integers as int,
    floats as float, and non-numeric values as strings.
    """
    text = clean_cell(value)
    if not text:
        return ""

    try:
        num = float(text)
        if num.is_integer():
            return int(num)
        return num
    except ValueError:
        return text


def is_header_row(row):
    """
    Detect header rows extracted from the table.
    We use Arabic header words because the PDF table is Arabic.
    """
    joined = " ".join(clean_cell(c) for c in row if c is not None)
    return (
        "ﺭﺮﻘﻤﻟﺍ" in joined
        and "ﺔﺒﻌﺸﻟﺍ" in joined
        and "ﺮﺿﺎﺤﻤﻟﺍ" in joined
    )


def is_subheader_row(row):
    """
    Detect the second table header line (from / to / days).
    """
    joined = " ".join(clean_cell(c) for c in row if c is not None)
    return "ﻰﻟﺇ" in joined and "ﻦﻣ" in joined and "ﻡﺎﻳﻷﺍ" in joined


def build_record_from_row(row, previous_main_record=None):
    """
    Build a normalized flat record from an extracted PDF row.

    Real extracted column order from the timetable PDF:
    0  = final_exam_start_time
    1  = ready
    2  = blocked
    3  = final_exam_date
    4  = instructor
    5  = location
    6  = time_end
    7  = time_start
    8  = days
    9  = registered
    10 = max_limit
    11 = serial
    12 = activity
    13 = level
    14 = credits
    15 = course_name
    16 = course_code
    17 = section
    18 = extra / empty

    Some timetable rows are continuation rows:
    they contain only location/time/days and belong to the previous section.
    """

    row = [clean_cell(c) for c in row]

    def val(i):
        return row[i] if i < len(row) else ""

    section = val(17)
    course_code = val(16)
    course_name = val(15)
    credits = val(14)
    days = val(8)
    time_start = val(7)
    time_end = val(6)
    location = val(5)
    instructor = val(4)

    # A continuation row has no main identifiers,
    # but it still has enough scheduling information to form another meeting row.
    is_continuation = (
        not section
        and not course_code
        and not course_name
        and (time_start or time_end or location or days)
    )

    if is_continuation:
        if not previous_main_record:
            return None, previous_main_record

        record = {
            "section": previous_main_record["section"],
            "course_code": previous_main_record["course_code"],
            "course_name": previous_main_record["course_name"],
            "credits": previous_main_record["credits"],
            "days": days or previous_main_record["days"],
            "time_start": time_start,
            "time_end": time_end,
            "location": normalize_arabic_text(location),
            "instructor": previous_main_record["instructor"],
        }
        return record, previous_main_record

    # A main row contains the identifying course/section data.
    if section and course_code and course_name:
        record = {
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
        return record, record

    return None, previous_main_record


def extract_tables_from_page(page):
    """
    Extract all table rows from a page and normalize them into flat records.
    """
    tables = page.extract_tables()
    records = []

    previous_main_record = None

    for table in tables or []:
        if not table:
            continue

        for row in table:
            if not row:
                continue

            cleaned = [clean_cell(c) for c in row]

            if not any(cleaned):
                continue

            if is_header_row(cleaned):
                continue

            if is_subheader_row(cleaned):
                continue

            record, previous_main_record = build_record_from_row(
                cleaned,
                previous_main_record
            )

            if record:
                records.append(record)

    return records


def main():
    """Main entry point."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    pdf_path = find_single_pdf(RAW_DIR)
    print(f"Using PDF: {pdf_path.name}")

    male_records = []
    female_records = []
    skipped_pages = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            page_text = page.extract_text() or ""
            gender = detect_gender_from_text(page_text)

            if gender is None:
                skipped_pages.append(page_index)
                continue

            page_records = extract_tables_from_page(page)

            if gender == "M":
                male_records.extend(page_records)
            elif gender == "F":
                female_records.extend(page_records)

            print(
                f"Page {page_index}: gender={gender}, extracted_rows={len(page_records)}"
            )

    males_out = OUT_DIR / "males_timetable.json"
    females_out = OUT_DIR / "females_timetable.json"
    config_out = OUT_DIR / "config.json"

    with males_out.open("w", encoding="utf-8") as f:
        json.dump(male_records, f, ensure_ascii=False, indent=2)

    with females_out.open("w", encoding="utf-8") as f:
        json.dump(female_records, f, ensure_ascii=False, indent=2)

    # Create config only if it does not exist yet.
    if not config_out.exists():
        with config_out.open("w", encoding="utf-8") as f:
            json.dump(
                {
                    "price_per_credit": 0,
                    "default_scholarship_pct": 0
                },
                f,
                ensure_ascii=False,
                indent=2,
            )

    print("\nDone.")
    print(f"Male rows: {len(male_records)}")
    print(f"Female rows: {len(female_records)}")
    print(f"Saved: {males_out}")
    print(f"Saved: {females_out}")
    print(f"Saved: {config_out}")

    if skipped_pages:
        print(
            "Warning: skipped pages without gender header: "
            + ", ".join(map(str, skipped_pages))
        )

if __name__ == "__main__":
    main()