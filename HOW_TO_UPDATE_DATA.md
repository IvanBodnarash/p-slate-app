# P.Slate Data Management Guide

This guide explains how to add, update, or remove timetable data in the P.Slate project.

The application uses static JSON files generated from PDF timetable files. These JSON files are used by the front-end to display courses, filter instructors, and generate schedules.

## 1. Data Structure Overview

The project keeps the raw PDF files and generated JSON files separate.

### Raw PDF files

Raw PDFs are stored in:

```txt
raw_pdf/
```

Current structure:

```txt
raw_pdf/
  summer_2026/
    summer.pdf

  first_2026_2027/
    boys.pdf
    girls.pdf
```

### Generated JSON files

Generated JSON files are stored in:

```txt
public/data/semesters/
```

Current structure:

```txt
public/data/semesters/
  summer_2026/
    males_timetable.json
    females_timetable.json

  first_2026_2027/
    males_timetable.json
    females_timetable.json
```

The application reads data from these generated JSON files, not directly from the PDF files.

## 2. Available Semesters

Currently, the app supports two semesters:

```txt
Summer Semester 2026
First Semester 2026-2027
```

Each semester has its own separate data folder.

This keeps the course data separated and prevents courses from different semesters from being mixed together.

## 3. How to Add or Update Summer Semester Data

The Summer Semester uses one mixed PDF file that contains both male and female timetable pages.

### Step 1: Replace the PDF

Go to:

```txt
raw_pdf/summer_2026/
```

Remove the old PDF and place the new Summer Semester PDF inside this folder.

There must be only one PDF file in this folder.

Example:

```txt
raw_pdf/summer_2026/summer.pdf
```

The file name can be different, but only one PDF should exist in the folder.

### Step 2: Run the parser

Run:

```bash
npm run parse:summer
```

This will generate:

```txt
public/data/semesters/summer_2026/males_timetable.json
public/data/semesters/summer_2026/females_timetable.json
```

### Step 3: Check the terminal output

After running the script, check the output in the terminal.

You should see something like:

```txt
Male rows: ...
Female rows: ...
Saved: public/data/semesters/summer_2026/males_timetable.json
Saved: public/data/semesters/summer_2026/females_timetable.json
```

If the number of rows is `0`, the PDF format may have changed and the parser may need to be adjusted.

## 4. How to Add or Update First Semester Data

The First Semester uses two separate PDF files:

```txt
boys.pdf
girls.pdf
```

The boys file is used to generate male timetable data.
The girls file is used to generate female timetable data.

### Step 1: Replace the PDFs

Go to:

```txt
raw_pdf/first_2026_2027/
```

Replace the old files with the new ones.

The folder should contain:

```txt
raw_pdf/first_2026_2027/boys.pdf
raw_pdf/first_2026_2027/girls.pdf
```

The file names should include `boys` and `girls`, because the parser uses these names to identify which file belongs to which group.

Recommended names:

```txt
boys.pdf
girls.pdf
```

### Step 2: Run the parser

Run:

```bash
npm run parse:first
```

This will generate:

```txt
public/data/semesters/first_2026_2027/males_timetable.json
public/data/semesters/first_2026_2027/females_timetable.json
```

### Step 3: Check the terminal output

After running the script, check that rows were extracted successfully.

Example:

```txt
Male rows: ...
Female rows: ...
Saved: public/data/semesters/first_2026_2027/males_timetable.json
Saved: public/data/semesters/first_2026_2027/females_timetable.json
```

If either `Male rows` or `Female rows` is `0`, the PDF format may have changed or the file names may not be correct.

## 5. How to Regenerate All Data

To regenerate all currently supported semester data, run:

```bash
npm run parse:timetable
```

This runs both parsers:

```bash
npm run parse:summer
npm run parse:first
```

Use this command when both Summer and First Semester PDFs have been updated.

## 6. How to Remove Semester Data

To remove a semester from the application, there are two parts:

1. Remove or ignore the generated data files.
2. Remove the semester option from the front-end.

### Step 1: Remove generated JSON files

For example, to remove First Semester data:

```txt
public/data/semesters/first_2026_2027/
```

You can delete this folder if the semester should no longer be available.

### Step 2: Remove the semester option from the app

Open:

```txt
src/store/useSemesterStore.js
```

Find the `SEMESTERS` list and remove the semester object.

Example:

```js
{
  id: "first_2026_2027",
  labelKey: "firstSemester2026_2027",
  defaultLabel: "First Semester 2026-2027",
}
```

After removing it, the button will no longer appear in the UI.

## 7. How to Add a New Semester in the Future

If a new semester is added later, such as:

```txt
Second Semester 2026-2027
```

we need to do three things:

### Step 1: Create a new raw PDF folder

Example:

```txt
raw_pdf/second_2026_2027/
```

### Step 2: Create or adapt a parser

If the PDF format is the same as the First Semester format, the existing First Semester parser can be adapted to generate data for the new semester.

If the PDF format is different, a new parser may be needed.

### Step 3: Add the semester to the front-end

Open:

```txt
src/store/useSemesterStore.js
```

Add a new object to the `SEMESTERS` list:

```js
{
  id: "second_2026_2027",
  labelKey: "secondSemester2026_2027",
  defaultLabel: "Second Semester 2026-2027",
}
```

Then add translations for the new label in the localization files.

## 8. Configuration File

The shared config file is stored here:

```txt
public/data/config.json
```

Example:

```json
{
  "price_per_credit": 0,
  "default_scholarship_pct": 0
}
```

This file controls the default tuition calculator values.

### Fields

```txt
price_per_credit
```

The default price for one credit.

```txt
default_scholarship_pct
```

The default scholarship percentage.

Example:

```json
{
  "price_per_credit": 2500,
  "default_scholarship_pct": 20
}
```

This config is shared across all semesters.

## 9. Important Rules

Please follow these rules when updating data:

1. Do not edit generated JSON files manually unless it is absolutely necessary.
2. Always update the PDF files first.
3. Always run the parser after replacing PDF files.
4. Keep Summer and First Semester files separate.
5. For Summer Semester, keep only one PDF inside:

```txt
raw_pdf/summer_2026/
```

6. For First Semester, keep two PDFs inside:

```txt
raw_pdf/first_2026_2027/
```

Recommended file names:

```txt
boys.pdf
girls.pdf
```

7. After running a parser, always check that the row count is not `0`.

## 10. Common Commands

Run the development server:

```bash
npm run dev
```

Parse Summer Semester data:

```bash
npm run parse:summer
```

Parse First Semester data:

```bash
npm run parse:first
```

Parse all timetable data:

```bash
npm run parse:timetable
```

Build the project:

```bash
npm run build
```

## 11. Troubleshooting

### Problem: The parser returns 0 rows

Possible reasons:

- The PDF format changed.
- The PDF file is in the wrong folder.
- The file name does not include `boys` or `girls` for First Semester.
- The PDF table structure changed and the parser needs to be updated.

### Problem: Courses do not appear in the app

Check:

1. The correct semester is selected in the app.
2. The JSON files exist in:

```txt
public/data/semesters/
```

3. The parser was run successfully.
4. The generated JSON files are not empty.
5. The app was restarted after data changes.

### Problem: Wrong courses appear for a semester

Check that the PDFs were placed in the correct folder.

Summer data should be in:

```txt
raw_pdf/summer_2026/
```

First Semester data should be in:

```txt
raw_pdf/first_2026_2027/
```

Do not mix PDFs from different semesters in the same folder.

## 12. Recommended Workflow

When new timetable data is received:

1. Identify which semester the PDF belongs to.
2. Place the PDF file in the correct folder.
3. Run the correct parser.
4. Check the terminal output.
5. Start the app locally.
6. Select the semester in the UI.
7. Verify that courses appear correctly.
8. Test course search, filters, and schedule generation.
9. Commit the updated PDF and generated JSON files if everything is correct.
