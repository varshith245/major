import hashlib
import datetime
from io import BytesIO
from typing import Dict, Any, List, Optional

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from ..models.schemas import Scheme

# Official Palette
PRIMARY_COLOR = colors.HexColor("#0B3B60")    # National Gov Blue
SECONDARY_COLOR = colors.HexColor("#1E3A8A")  # Deep Navy
ACCENT_AMBER = colors.HexColor("#D97706")     # Saffron/Gold
ACCENT_GREEN = colors.HexColor("#047857")     # Forest Emerald
ACCENT_ROSE = colors.HexColor("#BE123C")      # Alert Rose
TEXT_DARK = colors.HexColor("#0F172A")        # Slate 900
TEXT_MUTED = colors.HexColor("#475569")       # Slate 600
BORDER_COLOR = colors.HexColor("#CBD5E1")     # Slate 300
BG_LIGHT = colors.HexColor("#F8FAFC")         # Slate 50

class PDFExportService:
    def __init__(self):
        self.base_styles = getSampleStyleSheet()

    def _build_styles(self, is_landscape: bool = False):
        styles = {
            "title": ParagraphStyle(
                "GovTitle",
                parent=self.base_styles["Heading1"],
                fontName="Helvetica-Bold",
                fontSize=16 if not is_landscape else 14,
                leading=19 if not is_landscape else 17,
                textColor=PRIMARY_COLOR,
                alignment=1
            ),
            "subtitle": ParagraphStyle(
                "GovSubtitle",
                parent=self.base_styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=9 if not is_landscape else 8,
                leading=12 if not is_landscape else 10,
                textColor=ACCENT_AMBER,
                alignment=1
            ),
            "header_label": ParagraphStyle(
                "GovHeaderLabel",
                parent=self.base_styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=8,
                leading=10,
                textColor=TEXT_MUTED,
                alignment=1
            ),
            "section_heading": ParagraphStyle(
                "GovSectionHeading",
                parent=self.base_styles["Heading2"],
                fontName="Helvetica-Bold",
                fontSize=11 if not is_landscape else 10,
                leading=13 if not is_landscape else 12,
                textColor=PRIMARY_COLOR,
                spaceBefore=6,
                spaceAfter=4
            ),
            "cell_label": ParagraphStyle(
                "GovCellLabel",
                parent=self.base_styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=8 if not is_landscape else 7.5,
                leading=10 if not is_landscape else 9.5,
                textColor=TEXT_DARK
            ),
            "cell_value": ParagraphStyle(
                "GovCellValue",
                parent=self.base_styles["Normal"],
                fontName="Helvetica",
                fontSize=8 if not is_landscape else 7.5,
                leading=10 if not is_landscape else 9.5,
                textColor=TEXT_DARK
            ),
            "cell_value_bold": ParagraphStyle(
                "GovCellValueBold",
                parent=self.base_styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=8 if not is_landscape else 7.5,
                leading=10 if not is_landscape else 9.5,
                textColor=TEXT_DARK
            ),
            "tbl_header": ParagraphStyle(
                "GovTblHeader",
                parent=self.base_styles["Normal"],
                fontName="Helvetica-Bold",
                fontSize=8 if not is_landscape else 8,
                leading=10 if not is_landscape else 10,
                textColor=colors.white,
                alignment=1
            ),
            "disclaimer": ParagraphStyle(
                "GovDisclaimer",
                parent=self.base_styles["Normal"],
                fontName="Helvetica",
                fontSize=6.5 if not is_landscape else 6,
                leading=8.5 if not is_landscape else 8,
                textColor=TEXT_MUTED
            ),
            "security_hash": ParagraphStyle(
                "GovSecurityHash",
                parent=self.base_styles["Normal"],
                fontName="Courier",
                fontSize=6.5,
                leading=8,
                textColor=TEXT_MUTED
            )
        }
        return styles

    def generate_application_acknowledgment_pdf(
        self,
        app_data: Dict[str, Any],
        user_data: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Generates an official, print-ready Citizen Application Submission
        and Status Acknowledgment Slip (A4 Portrait).
        """
        buf = BytesIO()
        doc = SimpleDocTemplate(
            buf,
            pagesize=A4,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36,
            pageCompression=0
        )

        styles = self._build_styles(is_landscape=False)
        story = []

        now_str = datetime.datetime.now().strftime("%d %B %Y, %I:%M %p IST")
        ref_no = app_data.get("reference_no", "SEV-APP-REF")
        app_id = app_data.get("id", "APP-UNKNOWN")
        user_id = app_data.get("user_id", "ANONYMOUS")
        status = app_data.get("status", "Submitted")
        scheme_name = app_data.get("scheme_name", "Government Welfare Scheme")
        submission_date = app_data.get("submission_date", "Recorded")
        last_updated = app_data.get("last_updated", submission_date)
        current_stage = app_data.get("current_stage", "Application Submitted")
        stage_order = app_data.get("stage_order", 1)
        notes = app_data.get("notes", "Filing acknowledgment successfully generated.")
        sanction_amount = app_data.get("sanction_amount")
        missing_docs = app_data.get("missing_documents")

        # Digital tracking signature
        raw_sig = f"{app_id}:{ref_no}:{user_id}:{submission_date}:{status}"
        security_hash = hashlib.sha256(raw_sig.encode()).hexdigest()

        # Status badge color determination
        status_color = ACCENT_AMBER
        if status == "Approved":
            status_color = ACCENT_GREEN
        elif status == "Under Review":
            status_color = PRIMARY_COLOR
        elif status == "Rejected":
            status_color = ACCENT_ROSE

        # Header Block
        story.append(Paragraph("SEVA AI &bull; NATIONAL E-GOVERNANCE SERVICE", styles["subtitle"]))
        story.append(Spacer(1, 2))
        story.append(Paragraph("OFFICIAL APPLICATION ACKNOWLEDGMENT SLIP", styles["title"]))
        story.append(Spacer(1, 2))
        story.append(Paragraph(f"Generated on {now_str} &bull; Official Digital Registry Tracking", styles["header_label"]))
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY_COLOR, spaceAfter=8, spaceBefore=0))

        # Status & Reference Highlight Box
        status_box_data = [
            [
                Paragraph("ACKNOWLEDGMENT REFERENCE NO:", styles["cell_label"]),
                Paragraph(f"<b>{ref_no}</b>", styles["cell_value_bold"]),
                Paragraph("OFFICIAL STATUS:", styles["cell_label"]),
                Paragraph(f"<font color='{status_color.hexval()}'><b>{status.upper()}</b></font>", styles["cell_value_bold"])
            ],
            [
                Paragraph("APPLICATION ID:", styles["cell_label"]),
                Paragraph(f"<b>{app_id}</b>", styles["cell_value"]),
                Paragraph("LIFECYCLE MILESTONE:", styles["cell_label"]),
                Paragraph(f"Stage {stage_order} of 5 &bull; {current_stage}", styles["cell_value"])
            ]
        ]
        status_table = Table(status_box_data, colWidths=[140, 130, 110, 143])
        status_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
            ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(status_table)
        story.append(Spacer(1, 10))

        # Section 1: Scheme & Department Details
        story.append(Paragraph("1. Scheme & Department Particulars", styles["section_heading"]))
        scheme_data = [
            [Paragraph("Target Scheme Name:", styles["cell_label"]), Paragraph(scheme_name, styles["cell_value_bold"])],
            [Paragraph("Scheme Identifier:", styles["cell_label"]), Paragraph(app_data.get("scheme_id", "N/A"), styles["cell_value"])],
            [Paragraph("Category / Sector:", styles["cell_label"]), Paragraph(app_data.get("category", "Public Welfare"), styles["cell_value"])],
            [Paragraph("Official Departmental Portal:", styles["cell_label"]), Paragraph(app_data.get("portal_url", "https://www.india.gov.in"), styles["cell_value"])],
        ]
        scheme_table = Table(scheme_data, colWidths=[160, 363])
        scheme_table.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(scheme_table)
        story.append(Spacer(1, 8))

        # Section 2: Applicant Information
        story.append(Paragraph("2. Applicant Information", styles["section_heading"]))
        citizen_name = (user_data or {}).get("full_name") or app_data.get("applicant_name") or "Verified Registered Citizen"
        citizen_email = (user_data or {}).get("email") or "Registered Account"
        
        applicant_data = [
            [Paragraph("Applicant Full Name:", styles["cell_label"]), Paragraph(citizen_name, styles["cell_value"])],
            [Paragraph("Citizen User ID:", styles["cell_label"]), Paragraph(user_id, styles["cell_value"])],
            [Paragraph("Registered Email / Mobile:", styles["cell_label"]), Paragraph(citizen_email, styles["cell_value"])],
        ]
        applicant_table = Table(applicant_data, colWidths=[160, 363])
        applicant_table.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(applicant_table)
        story.append(Spacer(1, 8))

        # Section 3: Verification & Decision Lifecycle Record
        story.append(Paragraph("3. Administrative Verification & Decision Details", styles["section_heading"]))
        decision_data = [
            [Paragraph("Submission Filing Date:", styles["cell_label"]), Paragraph(submission_date, styles["cell_value"])],
            [Paragraph("Last Department Update:", styles["cell_label"]), Paragraph(last_updated, styles["cell_value"])],
            [Paragraph("Current Workflow Stage:", styles["cell_label"]), Paragraph(f"{current_stage} (Milestone {stage_order} of 5)", styles["cell_value"])],
        ]

        if sanction_amount is not None:
            decision_data.append([
                Paragraph("Benefit Sanction Amount:", styles["cell_label"]),
                Paragraph(f"<b>Rs. {sanction_amount:,.2f} (Direct Benefit Transfer)</b>", styles["cell_value_bold"])
            ])

        if missing_docs and len(missing_docs) > 0:
            doc_str = ", ".join(missing_docs) if isinstance(missing_docs, list) else str(missing_docs)
            decision_data.append([
                Paragraph("Requested Missing Documents:", styles["cell_label"]),
                Paragraph(f"<font color='{ACCENT_AMBER.hexval()}'><b>{doc_str}</b></font> (Please upload via Document Vault)", styles["cell_value"])
            ])

        decision_data.append([
            Paragraph("Official Nodal Remarks:", styles["cell_label"]),
            Paragraph(notes or "No additional administrative remarks recorded.", styles["cell_value"])
        ])

        decision_table = Table(decision_data, colWidths=[160, 363])
        decision_table.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(decision_table)
        story.append(Spacer(1, 10))

        # Document Integrity & Tamper-Evident Hash Block
        sec_box_data = [
            [
                Paragraph("<b>DOCUMENT-INTEGRITY HASH (TAMPER-EVIDENT RECORD)</b>", styles["cell_label"]),
            ],
            [
                Paragraph(f"SHA-256 Digest: {security_hash}", styles["security_hash"]),
            ],
            [
                Paragraph(
                    "This cryptographic digest is a document-integrity hash computed from the application record parameters at export time. "
                    "It serves to verify document integrity and detect alterations, and does not constitute independent proof of official government authenticity. "
                    "Official statutory validity remains subject to verification against primary nodal departmental records.",
                    styles["disclaimer"]
                )
            ]
        ]
        sec_table = Table(sec_box_data, colWidths=[523])
        sec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
            ('BOX', (0, 0), (-1, -1), 0.75, BORDER_COLOR),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(sec_table)
        story.append(Spacer(1, 8))

        # Legal Disclaimer & Footnote
        story.append(Paragraph(
            "<b>STATUTORY DISCLAIMER & CITIZEN GUIDELINES:</b> Application statuses reflect official verification records from Government departmental authorities. "
            "This platform assists citizens with filing acknowledgment tracking and document readiness; official eligibility, sanction decisions, and benefit transfers are rendered exclusively by designated Government departmental authorities.",
            styles["disclaimer"]
        ))

        doc.build(story)
        return buf.getvalue()

    def generate_scheme_comparison_pdf(
        self,
        schemes: List[Scheme],
        comparison_fields: Dict[str, Any]
    ) -> bytes:
        """
        Generates a clean, print-friendly multi-scheme comparison matrix report (A4 Landscape).
        """
        buf = BytesIO()
        doc = SimpleDocTemplate(
            buf,
            pagesize=landscape(A4),
            leftMargin=24,
            rightMargin=24,
            topMargin=24,
            bottomMargin=24,
            pageCompression=0
        )

        styles = self._build_styles(is_landscape=True)
        story = []

        now_str = datetime.datetime.now().strftime("%d %B %Y, %I:%M %p IST")
        scheme_count = len(schemes)

        # Header
        story.append(Paragraph("SEVA AI &bull; PUBLIC WELFARE SCHEME COMPARATIVE BENCHMARK", styles["subtitle"]))
        story.append(Spacer(1, 2))
        story.append(Paragraph("SCHEME COMPARISON & ENTITLEMENT MATRIX REPORT", styles["title"]))
        story.append(Spacer(1, 2))
        story.append(Paragraph(
            f"Generated on {now_str} &bull; Comparative Analysis of {scheme_count} Welfare Schemes",
            styles["header_label"]
        ))
        story.append(Spacer(1, 6))
        story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY_COLOR, spaceAfter=6, spaceBefore=0))

        # Table dimensions (usable width = 842 - 48 = 794 points)
        param_col_width = 134
        avail_for_schemes = 794 - param_col_width
        scheme_col_width = avail_for_schemes / max(1, scheme_count)
        col_widths = [param_col_width] + [scheme_col_width] * scheme_count

        # Build Table Data
        # Header Row
        header_row = [Paragraph("<b>Evaluation Parameter</b>", styles["tbl_header"])]
        for s in schemes:
            header_row.append(Paragraph(f"<b>{s.scheme_name}</b><br/><font size='6.5'>({s.short_name})</font>", styles["tbl_header"]))

        table_data = [header_row]

        def fmt_row(label: str, values: List[Any], bold: bool = False):
            row = [Paragraph(f"<b>{label}</b>", styles["cell_label"])]
            for val in values:
                text_val = str(val) if val is not None else "N/A"
                st = styles["cell_value_bold"] if bold else styles["cell_value"]
                row.append(Paragraph(text_val, st))
            return row

        # Parameters
        table_data.append(fmt_row("Ministry / Department", [s.ministry for s in schemes]))
        table_data.append(fmt_row("Level & Jurisdiction", comparison_fields.get("levels", [f"{s.level} ({s.state})" for s in schemes])))
        table_data.append(fmt_row("Welfare Category", [s.category for s in schemes], bold=True))
        
        # Financial Benefit
        clean_benefits = []
        for s in schemes:
            if s.benefit_amount > 0:
                clean_benefits.append(f"Rs. {s.benefit_amount:,.0f} / year")
            else:
                clean_benefits.append("Subsidy / In-Kind Entitlement")
        table_data.append(fmt_row("Financial Benefit Amount", clean_benefits, bold=True))

        table_data.append(fmt_row("Key Benefit Details", [s.key_benefits for s in schemes]))
        table_data.append(fmt_row("Age Criteria", comparison_fields.get("age_criteria", [f"{s.eligibility_criteria.min_age} to {s.eligibility_criteria.max_age} yrs" for s in schemes])))
        table_data.append(fmt_row("Income Ceiling", comparison_fields.get("income_limits", ["No ceiling" for _ in schemes])))
        table_data.append(fmt_row("Landholding Rule", comparison_fields.get("landholding_rules", ["Not mandatory" for _ in schemes])))
        table_data.append(fmt_row("Mandatory Documents", comparison_fields.get("required_documents", [", ".join(s.required_documents[:3]) for s in schemes])))
        table_data.append(fmt_row("Turnaround Processing", comparison_fields.get("processing_times", [f"{s.processing_time_days} days" for s in schemes])))
        table_data.append(fmt_row("Official Portal Link", [s.application_link for s in schemes]))

        comp_table = Table(table_data, colWidths=col_widths, repeatRows=1)
        
        t_style = [
            ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ('TOPPADDING', (0, 0), (-1, -1), 3.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ]

        # Alternating background colors for rows
        for i in range(1, len(table_data)):
            if i % 2 == 1:
                t_style.append(('BACKGROUND', (0, i), (-1, i), BG_LIGHT))
            else:
                t_style.append(('BACKGROUND', (0, i), (-1, i), colors.white))

        comp_table.setStyle(TableStyle(t_style))
        story.append(comp_table)
        story.append(Spacer(1, 6))

        # Footer Notice
        story.append(Paragraph(
            "<b>LEGAL & PROCEDURAL NOTICE:</b> Comparative data is sourced from active Government scheme gazettes and nodal portal guidelines. "
            "Citizens should review specific scheme guidelines and upload verified documents prior to final submission on designated official portals.",
            styles["disclaimer"]
        ))

        doc.build(story)
        return buf.getvalue()

pdf_export_service = PDFExportService()
