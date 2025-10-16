import os
from flask import current_app
from werkzeug.utils import secure_filename
from uuid import uuid4  



def allowed_file(filename):
    """Checks if the file extension is in the allowed set (PDF)[cite: 9]."""
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in current_app.config["ALLOWED_EXTENSIONS"]
    )


def save_uploaded_files(files):
    """
    Saves a list of uploaded files to the local UPLOAD_FOLDER and returns their metadata.

    Returns: A list of metadata dictionaries (filename, path, mime_type, size).
    """
    metadata_list = []

  
    if len(files) > current_app.config["MAX_FILE_UPLOADS"]:
        raise ValueError(
            f"Only up to {current_app.config['MAX_FILE_UPLOADS']} documents are allowed."
        )

    for file in files:
        if file and allowed_file(file.filename):
            
            original_filename = secure_filename(file.filename)
            unique_filename = f"{uuid4().hex}_{original_filename}"

            filepath = os.path.join(
                current_app.config["UPLOAD_FOLDER"], unique_filename
            )

           
            file.save(filepath)

           
            metadata_list.append(
                {
                    "original_name": original_filename,
                    "stored_name": unique_filename,
                    "filepath": filepath,  # Local path (for local storage)
                    "mime_type": file.mimetype,
                    "size_bytes": os.path.getsize(filepath),
                }
            )
        else:
         
            print(f"Skipping invalid file: {file.filename if file else 'None'}")

    return metadata_list
