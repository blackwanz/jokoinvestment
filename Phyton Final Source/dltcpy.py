import os
import sys
import logging
import pandas as pd  # To read the Excel file

# Setup logging to write to a file
log_filename = "contract_data_log.txt"
logging.basicConfig(filename=log_filename, level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Function to get the directory of the current script
def get_script_directory():
    if getattr(sys, 'frozen', False):
        # For bundled executable (PyInstaller)
        return os.path.dirname(sys.executable)
    else:
        # Normal script
        return os.path.dirname(os.path.abspath(__file__))

# Read contract numbers from the Excel file
def get_contract_numbers_from_excel():
    script_dir = get_script_directory()
    excel_file = os.path.join(script_dir, 'dltcpy.xlsx')  # Excel filename

    if os.path.exists(excel_file):
        logging.debug(f"Found Excel file: {excel_file}")
        df = pd.read_excel(excel_file)
        # Check if 'Processed' column exists, else add it
        if 'Processed' not in df.columns:
            df['Processed'] = 'No'  # Set default as 'No' (not processed)
            df.to_excel(excel_file, index=False)  # Save back the changes to Excel

        # Filter contracts that haven't been processed
        contract_numbers = df[df['Processed'] == 'No']['Contract No'].tolist()
        logging.debug(f"Contract numbers to process: {contract_numbers}")
        return contract_numbers, df
    else:
        logging.error(f"Excel file not found in directory: {script_dir}")
        return [], None

# Function to update the existing DLTCPY.mac file with the contract number
def update_hascript_with_contract(contract_number):
    script_dir = get_script_directory()
    hascript_filename = os.path.join(script_dir, 'DLTCPY.mac')  # Target file

    logging.debug(f"Trying to read/write DLTCPY.mac at: {hascript_filename}")

    if os.path.exists(hascript_filename):
        logging.debug(f"Found HAScript file: {hascript_filename}")

        # Read the current content of the file
        with open(hascript_filename, 'r') as file:
            content_before = file.read()
            logging.debug(f"Before update (first 200 chars): {content_before[:200]}...")  # Show a snippet for clarity

        # Append the new contract details
        with open(hascript_filename, 'a') as file:
            file.write(f"""<vars>
 <create name="$Contract$" type="string" value="{contract_number}" />
</vars>
<screen name="Screen1" entryscreen="true" exitscreen="true" transient="false">
 <description>
 <oia status="NOTINHIBITED" optional="false" invertmatch="false" />
 </description>
 <actions>
 <prompt name="&apos;Enter Contract Number&apos;" description="" row="18" col="07"
 len="8" default="$Contract$" clearfield="false" encrypted="false"
 movecursor="true" xlatehostkeys="true" assigntovar="$Contract$"
 varupdateonly="true" />
 <input value="$Contract$" row="18" col="07" movecursor="true" xlatehostkeys="true" encrypted="false" />
 </actions>
</screen>
<nextscreens timeout="0" >
</nextscreens>
""")
            file.flush()  # Ensure content is written to disk immediately

        # Read the updated content of the file
        with open(hascript_filename, 'r') as file:
            content_after = file.read()
            logging.debug(f"After update (first 200 chars): {content_after[:200]}...")  # Show a snippet for clarity
    else:
        logging.error(f"DLTCPY.mac file not found at {hascript_filename}")

# Function to update the Excel file and mark the contract as processed
def mark_contract_as_processed(contract_number, df):
    df.loc[df['Contract No'] == contract_number, 'Processed'] = 'Yes'
    script_dir = get_script_directory()
    excel_file = os.path.join(script_dir, 'dltcpy.xlsx')
    df.to_excel(excel_file, index=False)
    logging.debug(f"Contract {contract_number} marked as processed in the Excel file.")

# Simulated function to call the AS/400 program with a contract number
def call_program_with_contract(contract_number):
    logging.debug(f"Calling AS/400 program with contract number: {contract_number}")
    # Simulate the process, e.g., by sending the contract number to an AS/400 system
    # You would implement the actual logic for calling the program here
    # For now, we just simulate a delay for the sake of this example
    import time
    time.sleep(1)
    logging.debug(f"Program called successfully for contract {contract_number}.")

# Main function to handle the contract numbers and update the DLTCPY.mac file
def process_contract_numbers():
    contract_numbers, df = get_contract_numbers_from_excel()

    if not contract_numbers:
        logging.error("No contract numbers found in the Excel file.")
        return

    # Process the first unprocessed contract
    contract = contract_numbers[0]
    logging.debug(f"Processing contract number: {contract}")
    update_hascript_with_contract(contract)  # Update the DLTCPY.mac file
    call_program_with_contract(contract)  # Simulate calling the program
    mark_contract_as_processed(contract, df)  # Mark as processed
    logging.debug(f"HAScript for contract {contract} updated and program called successfully.")

# Run the main processing function
if __name__ == "__main__":
    process_contract_numbers()
