import io
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


class PDFReportService:
    @staticmethod
    def generate_prediction_pdf(
        disease_name: str,
        input_data: Dict[str, Any],
        prediction: int,
        status: str,
        probability: Optional[float],
        shap_explanations: Optional[List[Dict[str, Any]]] = None,
        patient_name: Optional[str] = "Clinical Patient",
        patient_email: Optional[str] = "N/A",
        created_at: Optional[Any] = None
    ) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom Branded Styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#06b6d4') # Cyan 500
        )
        subtitle_style = ParagraphStyle(
            'DocSubTitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=12,
            textColor=colors.HexColor('#94a3b8') # Slate 400
        )
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#0f172a'), # Slate 900
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#334155')
        )
        body_bold = ParagraphStyle(
            'BodyBoldCustom',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#0f172a')
        )

        elements = []

        # 1. Header Banner & Branding
        header_data = [
            [
                Paragraph("<b>MediVision AI</b>", title_style),
                Paragraph(f"<b>Report Date:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style)
            ],
            [
                Paragraph("Explainable Healthcare Intelligence Report", subtitle_style),
                Paragraph("CONFIDENTIAL CLINICAL SUMMARY", ParagraphStyle('RedSub', parent=subtitle_style, textColor=colors.HexColor('#ef4444')))
            ]
        ]
        header_table = Table(header_data, colWidths=[3.5*inch, 3.5*inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('TOPPADDING', (0,0), (-1,-1), 2),
        ]))

        elements.append(header_table)
        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#06b6d4'), spaceBefore=2, spaceAfter=12))

        # 2. Patient & Session Metadata Card
        timestamp_str = "N/A"
        if created_at:
            if isinstance(created_at, datetime):
                timestamp_str = created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
            else:
                timestamp_str = str(created_at)

        patient_info_data = [
            [
                Paragraph("<b>Patient Name:</b>", body_bold), Paragraph(str(patient_name or 'N/A'), body_style),
                Paragraph("<b>Diagnostic Module:</b>", body_bold), Paragraph(disease_name.upper(), body_bold)
            ],
            [
                Paragraph("<b>Patient Email:</b>", body_bold), Paragraph(str(patient_email or 'N/A'), body_style),
                Paragraph("<b>Assessment Time:</b>", body_bold), Paragraph(timestamp_str, body_style)
            ]
        ]
        patient_table = Table(patient_info_data, colWidths=[1.1*inch, 2.4*inch, 1.3*inch, 2.2*inch])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(patient_table)
        elements.append(Spacer(1, 14))

        # 3. Diagnostic Prediction & Confidence Result Card
        is_positive = (status.strip().lower() == "positive" or prediction == 1)
        bg_color = colors.HexColor('#fef2f2') if is_positive else colors.HexColor('#f0fdf4')
        border_color = colors.HexColor('#f87171') if is_positive else colors.HexColor('#4ade80')
        text_color = colors.HexColor('#991b1b') if is_positive else colors.HexColor('#166534')

        confidence_pct = f"{round(probability * 100, 1)}%" if probability is not None else "N/A"
        result_title = f"DIAGNOSTIC RESULT: {'HIGH RISK DETECTED' if is_positive else 'LOW RISK / NORMAL PROFILE'}"
        risk_level_desc = "Elevated risk probability based on clinical feature analysis. Follow-up recommended." if is_positive else "Input indicators fall within expected low-risk parameters."

        res_data = [
            [Paragraph(f"<b>{result_title}</b>", ParagraphStyle('ResTitle', parent=body_bold, fontSize=12, leading=15, textColor=text_color))],
            [Paragraph(f"<b>Prediction Status:</b> {status.upper()} | <b>Model Confidence Score:</b> {confidence_pct}", ParagraphStyle('ResDetails', parent=body_style, fontSize=10, leading=13, textColor=text_color))],
            [Paragraph(f"<b>Clinical Overview:</b> {risk_level_desc}", ParagraphStyle('ResDesc', parent=body_style, fontSize=9, leading=12, textColor=colors.HexColor('#475569')))]
        ]
        res_table = Table(res_data, colWidths=[7.0*inch])
        res_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_color),
            ('BOX', (0,0), (-1,-1), 1, border_color),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(res_table)
        elements.append(Spacer(1, 16))

        # 4. Clinical Input Parameters Table
        elements.append(Paragraph("Submitted Clinical Input Parameters", section_heading))
        input_rows = [[Paragraph("<b>Feature Parameter</b>", body_bold), Paragraph("<b>Submitted Value</b>", body_bold)]]
        for key, val in (input_data or {}).items():
            formatted_key = key.replace("_", " ").title()
            input_rows.append([
                Paragraph(formatted_key, body_style),
                Paragraph(str(val), body_bold)
            ])

        input_table = Table(input_rows, colWidths=[4.2*inch, 2.8*inch])
        input_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (1,0), colors.HexColor('#e2e8f0')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        elements.append(input_table)
        elements.append(Spacer(1, 16))

        # 5. SHAP Feature Importance & Explanation Table
        if shap_explanations:
            elements.append(Paragraph("SHAP Explainable AI (XAI) Feature Importance", section_heading))
            shap_rows = [
                [
                    Paragraph("<b>Feature Name</b>", body_bold),
                    Paragraph("<b>Feature Value</b>", body_bold),
                    Paragraph("<b>SHAP Score</b>", body_bold),
                    Paragraph("<b>Impact Direction</b>", body_bold)
                ]
            ]
            for item in shap_explanations[:8]:
                feat_name = str(item.get("feature_name", ""))
                feat_val = str(item.get("feature_value", ""))
                shap_score = str(round(float(item.get("shap_value", 0.0)), 4))
                impact = str(item.get("impact", "")).lower()

                impact_p_style = ParagraphStyle(
                    'ImpactP',
                    parent=body_style,
                    fontName='Helvetica-Bold',
                    textColor=colors.HexColor('#dc2626') if impact == "positive" else colors.HexColor('#16a34a')
                )
                impact_text = "▲ Increases Risk" if impact == "positive" else "▼ Decreases Risk"

                shap_rows.append([
                    Paragraph(feat_name, body_style),
                    Paragraph(feat_val, body_style),
                    Paragraph(shap_score, body_style),
                    Paragraph(impact_text, impact_p_style)
                ])

            shap_table = Table(shap_rows, colWidths=[2.4*inch, 1.5*inch, 1.4*inch, 1.7*inch])
            shap_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                ('PADDING', (0,0), (-1,-1), 5),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ]))
            elements.append(shap_table)
            elements.append(Spacer(1, 16))

        # 6. Disclaimer & Footer
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94a3b8'), spaceBefore=10, spaceAfter=8))
        footer_text = "<b>CONFIDENTIALITY NOTICE & CLINICAL DISCLAIMER:</b> This medical prediction summary is generated by MediVision AI machine learning engines for assistive and educational evaluation. It does not replace professional clinical diagnosis or physician oversight."
        elements.append(Paragraph(footer_text, ParagraphStyle('FooterStyle', parent=body_style, fontSize=7, leading=9, textColor=colors.HexColor('#64748b'))))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()


pdf_service = PDFReportService()
