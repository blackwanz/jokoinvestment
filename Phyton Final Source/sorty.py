import os
import re

# Get current folder
folder_path = os.getcwd()

# List all files
files = os.listdir(folder_path)

# Only take mp4 files
video_files = [f for f in files if f.lower().endswith('.mp4')]

# Function to extract base number from end of filename
def extract_base_number(filename):
    name_without_ext = os.path.splitext(filename)[0]
    match = re.search(r'(\d{2,4})$', name_without_ext)  # cari angka 2-4 digit di paling akhir nama
    if match:
        number = int(match.group(1))
        return number
    return None

# Prepare log
log_lines = []
print("\n========== Start Debugging ==========\n")

# List all files
print(f"📂 Found {len(video_files)} MP4 files:")
log_lines.append(f"📂 Found {len(video_files)} MP4 files:")

for f in video_files:
    print(f" - {f}")
    log_lines.append(f" - {f}")

# Extract detected numbers
detected_numbers = {}

for filename in video_files:
    number = extract_base_number(filename)
    if number is not None:
        print(f"✅ Detected base number {number} from '{filename}'")
        log_lines.append(f"✅ Detected base number {number} from '{filename}'")
        if number not in detected_numbers:
            detected_numbers[number] = []
        detected_numbers[number].append(filename)
    else:
        print(f"⚠️ Could not detect number from '{filename}'")
        log_lines.append(f"⚠️ Could not detect number from '{filename}'")

# If nothing detected
if not detected_numbers:
    print("\n❌ No valid numbers detected. STOP.\n")
    log_lines.append("\n❌ No valid numbers detected. STOP.\n")
else:
    print("\n✅ Start renaming...\n")
    log_lines.append("\n✅ Start renaming...\n")

    for base_num in sorted(detected_numbers.keys()):
        files_in_group = detected_numbers[base_num]
        base_sequence = base_num * 10  # Multiply by 10
        print(f"\n📂 Group {base_num} --> {len(files_in_group)} files")
        log_lines.append(f"\n📂 Group {base_num} --> {len(files_in_group)} files")

        for i, filename in enumerate(files_in_group, start=1):
            new_number = base_sequence + i
            new_name = f"IMG_{new_number:05}.mp4"

            src = os.path.join(folder_path, filename)
            dst = os.path.join(folder_path, new_name)

            rename_info = f"Renaming '{filename}' -> '{new_name}'"
            print(rename_info)
            log_lines.append(rename_info)

            try:
                os.rename(src, dst)
            except Exception as e:
                error_line = f"❌ Error renaming {filename}: {str(e)}"
                print(error_line)
                log_lines.append(error_line)

print("\n========== End Debugging ==========")

# Save log
log_file = os.path.join(folder_path, "rename_debug_log.txt")
with open(log_file, "w", encoding="utf-8") as f:
    for line in log_lines:
        f.write(line + "\n")

print(f"\n📄 Debug log saved to: {log_file}\n")
