import os
from fpdf import FPDF

class DemoPDF(FPDF):
    def __init__(self, demo_banner):
        super().__init__()
        self.demo_banner = demo_banner

    def header(self):
        # Demo Banner Header
        self.set_fill_color(255, 235, 204)
        self.set_text_color(180, 83, 9)
        self.set_font('Helvetica', 'B', 9)
        self.cell(0, 8, self.demo_banner, border=1, align='C', fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()} | SYNTHETIC DEMO SOURCE - FOR LIFEOS TESTING ONLY', align='C')

def create_scholarship_notice(filepath):
    pdf = DemoPDF("SYNTHETIC DEMO DATA - NOT AN OFFICIAL SCHOLARSHIP")
    pdf.add_page()
    
    # Title
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "FutureTech Student Support Scholarship 2026", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "I", 10)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 6, "Official Announcement & Guidelines Notice", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(6)

    # Overview
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "1. Program Overview", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(51, 65, 85)
    pdf.multi_cell(0, 5, "The FutureTech Student Support Scholarship is a fictional merit and financial aid program designed to support students pursuing degrees in computer science, engineering, and artificial intelligence. Selected recipients receive annual educational funding and tech allowances.")
    pdf.ln(4)

    # Key Information Table
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "2. Key Program Details", new_x="LMARGIN", new_y="NEXT")
    
    details = [
        ("Application Deadline", "15 November 2026 (Strict Deadline)"),
        ("Scholarship Amount", "$5,000 / year stipend + $800 one-time tech allowance"),
        ("Eligible Age Range", "18 to 26 years old"),
        ("Income Threshold", "Household annual income below $60,000"),
        ("Minimum Academic Record", "Cumulative GPA of 3.2 or higher"),
        ("Issuing Organization", "FutureTech Foundation & Tech Student Board"),
        ("Program Coordinator", "Dr. Rajesh Kumar (Committee Chair)")
    ]

    pdf.set_font("Helvetica", "", 10)
    for label, val in details:
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(55, 6, label, border=1)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(130, 6, val, border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # Required Documents
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "3. Required Application Documents", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    docs = [
        "1. Income Certificate issued by local Revenue Authority (Status: Required)",
        "2. Official Certified Academic Transcript showing minimum 3.2 GPA",
        "3. Personal Statement Essay (500 words on career goals in technology)",
        "4. Copy of Government-issued Photo Identification"
    ]
    for d in docs:
        pdf.cell(0, 6, d, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # Application Steps / Actions
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "4. Application Steps & Required Actions", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    steps = [
        "Step 1: Request certified Income Certificate from local revenue office prior to 15 November 2026.",
        "Step 2: Complete the online registration form at https://futuretech-scholarship-demo.org",
        "Step 3: Upload transcripts, income proof, and personal statement essay.",
        "Step 4: Dispatch signed physical hard copy packet to FutureTech Selection Committee."
    ]
    for s in steps:
        pdf.multi_cell(0, 5, s)
        pdf.ln(1)
    pdf.ln(4)

    # Contact & Risks
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "5. Important Terms & Risk Warnings", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, "Late Penalty: Submissions received after 15 November 2026 will be automatically disqualified without appeal. Providing inaccurate income figures will result in immediate grant forfeiture.")
    pdf.ln(3)
    pdf.cell(0, 6, "Contact Support: support@futuretech-scholarship-demo.org | +1 (555) 019-2831", new_x="LMARGIN", new_y="NEXT")

    pdf.output(filepath)

def create_college_notice(filepath):
    pdf = DemoPDF("SYNTHETIC DEMO DATA - NOT AN OFFICIAL UNIVERSITY NOTICE")
    pdf.add_page()
    
    # Title
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "Apex Institute of Technology", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 6, "Office of Academic Affairs - Spring 2027 Registration Notice", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(6)

    # Notice Details
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "1. Registration Deadline & Fee Structure", new_x="LMARGIN", new_y="NEXT")
    
    fees = [
        ("Semester Registration Deadline", "20 November 2026"),
        ("Tuition Fee (Undergraduate / Graduate)", "$4,250.00"),
        ("Student Services & Lab Fee", "$350.00"),
        ("Total Amount Payable", "$4,600.00"),
        ("Late Registration Penalty Fee", "$150.00 (applied post Nov 20)")
    ]

    pdf.set_font("Helvetica", "", 10)
    for label, val in fees:
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(65, 6, label, border=1)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(120, 6, val, border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # Required Clearances
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "2. Required Registration Documents", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "1. Updated Immunization & Health Record Certificate", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "2. Financial Clearance Payment Receipt from Bursar Office", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "3. Academic Advisor Course Sign-Off Form", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # Student Instructions
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "3. Student Instructions & Actions", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, "All enrolled students must complete course selection on the Apex Student Portal before 20 November 2026. Submit your health immunization certificate to student services room 102 prior to course lock.")
    pdf.ln(4)

    pdf.cell(0, 6, "Contact Registrar: registrar@apex-institute-demo.edu | Room 204 Administration Building", new_x="LMARGIN", new_y="NEXT")
    pdf.output(filepath)

def create_job_description(filepath):
    pdf = DemoPDF("SYNTHETIC DEMO DATA - NOT A REAL JOB POSTING")
    pdf.add_page()
    
    # Title
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "NovaStack Technologies", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 6, "Career Opportunity: Junior AI Engineer", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(6)

    # Role Overview
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "1. Role Overview", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, "NovaStack Technologies is seeking a talented Junior AI Engineer to build, evaluate, and deploy machine learning models, retrieval-augmented generation (RAG) pipelines, and API services for our enterprise product suite.")
    pdf.ln(4)

    # Skills Requirements
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "2. Skill Requirements", new_x="LMARGIN", new_y="NEXT")

    skills = [
        ("Required Skills", "Python 3.x, PyTorch or TensorFlow, SQL, REST APIs, Git version control"),
        ("Preferred Skills", "AWS Bedrock, LangChain, Vector DBs (Pinecone/Chroma), Docker, CI/CD"),
        ("Education Requirement", "Bachelor's Degree in Computer Science, Data Science, or AI"),
        ("Experience Level", "0 - 2 years (Internships and portfolio projects welcomed)"),
        ("Application Deadline", "05 December 2026")
    ]

    for label, val in skills:
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(50, 6, label, border=1)
        pdf.set_font("Helvetica", "", 9)
        pdf.cell(135, 6, val, border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # Responsibilities & Process
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "3. Key Responsibilities & Application Process", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "- Build and maintain LLM integration pipelines and data ingestion modules.", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "- Collaborate with product managers and backend developers on AI features.", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "- Application: Submit resume and GitHub profile to careers@novastack-demo.com", new_x="LMARGIN", new_y="NEXT")

    pdf.output(filepath)

def create_receipt(filepath):
    pdf = DemoPDF("SYNTHETIC DEMO DATA - NOT A REAL RECEIPT")
    pdf.add_page()
    
    # Store Title
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "TechNova Retail Store", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 5, "104 Tech Boulevard, Silicon District | Invoice # TN-2026-88492", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(6)

    # Invoice Details Table
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(40, 6, "Purchase Date:", border=0)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(60, 6, "12 September 2026", border=0, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(40, 6, "Payment Method:", border=0)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(60, 6, "Visa ending in 4921", border=0, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # Purchased Items Table
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_fill_color(241, 245, 249)
    pdf.cell(90, 7, "Product Description", border=1, fill=True)
    pdf.cell(25, 7, "Qty", border=1, align="C", fill=True)
    pdf.cell(35, 7, "Unit Price", border=1, align="R", fill=True)
    pdf.cell(35, 7, "Total", border=1, align="R", fill=True, new_x="LMARGIN", new_y="NEXT")

    items = [
        ("NovaBook Pro 15 Laptop (16GB RAM, 512GB SSD)", "1", "$1,199.00", "$1,199.00"),
        ("TechNova Noise-Cancelling Headphones", "1", "$199.00", "$199.00"),
        ("TechNova USB-C Multi-Port Hub", "1", "$49.00", "$49.00")
    ]

    pdf.set_font("Helvetica", "", 9)
    for p, q, u, t in items:
        pdf.cell(90, 6, p, border=1)
        pdf.cell(25, 6, q, border=1, align="C")
        pdf.cell(35, 6, u, border=1, align="R")
        pdf.cell(35, 6, t, border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    # Summary Totals
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(150, 6, "Subtotal:", align="R", border=1)
    pdf.cell(35, 6, "$1,447.00", align="R", border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.cell(150, 6, "Sales Tax (6%):", align="R", border=1)
    pdf.cell(35, 6, "$86.82", align="R", border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.cell(150, 7, "TOTAL PAID:", align="R", border=1)
    pdf.set_font("Helvetica", "B", 10)
    pdf.cell(35, 7, "$1,533.82", align="R", border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # Warranty Info
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 6, "Warranty & Return Policy", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.multi_cell(0, 5, "Warranty Included: 2-Year Extended Hardware Protection Warranty for NovaBook Pro 15. Valid through 12 September 2028. Returns accepted within 30 days with receipt.")

    pdf.output(filepath)

def create_program_update_v2(filepath):
    pdf = DemoPDF("SYNTHETIC DEMO DATA - NOT AN OFFICIAL DOCUMENT")
    pdf.add_page()
    
    # Title
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "FutureTech Student Support Scholarship (V2 REVISED)", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(180, 83, 9)
    pdf.cell(0, 6, "OFFICIAL REVISED PROGRAM UPDATE NOTICE - ACADEMIC YEAR 2026-2027", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(6)

    # What Changed Summary
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 7, "1. Overview of Program Policy Changes", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 5, "This revised notice supersedes the initial FutureTech Scholarship announcement. Please review the updated deadlines, increased funding allocations, revised eligibility income caps, and mandatory new recommendation document requirement.")
    pdf.ln(4)

    # Comparison Table of Changes
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 7, "2. Summary of Revised Terms (V1 vs V2 Comparison)", new_x="LMARGIN", new_y="NEXT")

    changes = [
        ("Application Deadline", "15 November 2026", "10 December 2026 (EXTENDED)"),
        ("Scholarship Stipend Amount", "$5,000 / year", "$6,500 / year (INCREASED BY $1,500)"),
        ("Household Income Threshold", "Below $60,000", "Below $75,000 (EXPANDED ELIGIBILITY)"),
        ("Required Documents", "Transcript, Income Proof, ID", "Transcript, Income Proof, ID + 1 Professor Recommendation Letter"),
        ("Application Procedure", "Online upload + Mail hard copy", "Digital Portal Upload ONLY (Physical mail removed)")
    ]

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(241, 245, 249)
    pdf.cell(45, 7, "Policy Area", border=1, fill=True)
    pdf.cell(65, 7, "Original Version (V1)", border=1, fill=True)
    pdf.cell(75, 7, "Revised Version (V2)", border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 9)
    for area, v1, v2 in changes:
        pdf.set_font("Helvetica", "B", 8)
        pdf.cell(45, 6, area, border=1)
        pdf.set_font("Helvetica", "", 8)
        pdf.cell(65, 6, v1, border=1)
        pdf.set_font("Helvetica", "B", 8)
        pdf.cell(75, 6, v2, border=1, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # Action Items
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 7, "3. Next Steps for Applicants", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "1. Obtain 1 Academic Recommendation Letter from a professor or supervisor.", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "2. Submit updated application before the extended 10 December 2026 deadline.", new_x="LMARGIN", new_y="NEXT")
    
    pdf.output(filepath)

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "documents")
    os.makedirs(out_dir, exist_ok=True)

    create_scholarship_notice(os.path.join(out_dir, "demo-scholarship-notice.pdf"))
    create_college_notice(os.path.join(out_dir, "demo-college-notice.pdf"))
    create_job_description(os.path.join(out_dir, "demo-job-description.pdf"))
    create_receipt(os.path.join(out_dir, "demo-receipt.pdf"))
    create_program_update_v2(os.path.join(out_dir, "demo-program-update-v2.pdf"))

    print("Successfully generated 5 synthetic demo PDFs in demo-data/documents/")
