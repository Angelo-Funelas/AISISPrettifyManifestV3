import json, shutil, os, zipfile

current_dir = os.path.dirname(os.path.abspath(__file__))
def generateChrome(template_filename, output_filename):
    global current_dir
    # Construct the full paths
    template_path = os.path.join(current_dir, template_filename)
    output_path = os.path.join(current_dir, output_filename)
    
    # Copy the template file to the output path
    shutil.copyfile(template_path, output_path)
    print(f"Chrome manifest saved to {output_path}")

def generateFirefox(chrome_manifest_path, firefox_manifest_path):
    with open(chrome_manifest_path, 'r') as file:
        chrome_manifest = json.load(file)
    
    # Create a new dictionary for Firefox manifest
    firefox_manifest = {
        "manifest_version": 2,
        "name": "AISIS Prettify - Improved User Interface",
        "version": chrome_manifest["version"],
        "description": chrome_manifest.get("description", ""),
        "author": chrome_manifest.get("author", ""),
        "browser_action": {
            "default_title": "AISIS Prettify - Improved User Interface",
            "default_icon": chrome_manifest["action"]["default_icon"],
            "default_popup": chrome_manifest["action"]["default_popup"]
        },
        "content_scripts": chrome_manifest["content_scripts"],
        "permissions": chrome_manifest["permissions"],
        "short_name": "AISIS Prettify",
        "web_accessible_resources": [
            resource for entry in chrome_manifest["web_accessible_resources"]
            for resource in entry["resources"]
        ],
        "browser_specific_settings": {
            "gecko": {
                "id": "dev.gelofunelas@gmail.com"
            }
        }
    }
    
    # Save the Firefox manifest to a new file
    with open(firefox_manifest_path, 'w') as file:
        json.dump(firefox_manifest, file, indent=2)
    
    print(f"Firefox manifest saved to {firefox_manifest_path}")

def zip(exclude,zipname):
    # Get the current directory where the script is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Set the output zip file name
    zip_name = os.path.join(current_dir, zipname)
    
    # Files and folders to exclude

    # Create a ZipFile object
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Walk through the folder
        for root, dirs, files in os.walk(current_dir):
            # Exclude directories
            dirs[:] = [d for d in dirs if os.path.join(root, d) not in exclude]
            
            for file in files:
                file_path = os.path.join(root, file)
                # Skip excluded files
                if (
                    file_path in exclude or
                    file.endswith('.zip') or
                    any(file_path.startswith(os.path.join(current_dir, folder)) for folder in exclude if os.path.isdir(folder))
                ):
                    continue
                # Write each file to the zip file
                arcname = os.path.relpath(file_path, current_dir)
                zipf.write(file_path, arcname)

    print(f"Generated '{zip_name}'.")


exclude = [
    os.path.join(current_dir, '.git'),            # Exclude .git folder
    os.path.join(current_dir, '.gitignore'),      # Exclude .gitignore file
    os.path.join(current_dir, 'manifest_template.json'), # Exclude manifest_template.json file
    os.path.join(current_dir, 'README.md'),       # Exclude README.md file
    os.path.abspath(__file__)                     # Exclude this script itself
]

print("For which browser should I compile for:")
print("0: Chrome")
print("1: Firefox")

choice = int(input())
if choice == 0:
    generateChrome('manifest_template.json', 'manifest.json')
elif choice == 1:
    generateFirefox('manifest_template.json', 'manifest.json')
    
print("Create a zip file (Y/N):")
if input().upper()=='Y':
    if choice == 0:
        zip(exclude, 'AISISPrettifyChrome.zip')
    elif choice == 1:
        zip(exclude, 'AISISPrettifyFirefox.zip')