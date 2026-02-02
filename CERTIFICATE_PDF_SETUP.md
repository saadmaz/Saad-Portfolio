# 📋 Certificate PDF Setup Guide

## ✅ What Was Done

Added `certificatePdfUrl` field to certificates to store PDF file paths.

### Updated Schema
```json
{
  "id": 1,
  "title": "Certificate Name",
  "issuer": "Organization",
  "issueDate": "2025-08",
  "expiryDate": "2028-08",
  "credentialId": "ABC-123",
  "credentialUrl": "https://verify.com",
  "description": "Description",
  "certificatePdfUrl": "/assets/Certificates/certificate-name.pdf"  ← NEW FIELD
}
```

---

## 📁 File Organization

### Where to Store PDFs
```
public/
├── assets/
│   └── Certificates/          ← Certificate PDFs go here
│       ├── AWS-Solutions-Architect.pdf
│       ├── GCP-Data-Engineer.pdf
│       ├── React-Advanced-Patterns.pdf
│       └── Node-Mastery.pdf
```

---

## 🚀 How to Use

### Step 1: Add Certificate PDF
1. Save your PDF to `public/assets/Certificates/`
2. Name it clearly (e.g., `AWS-Solutions-Architect.pdf`)

### Step 2: Update certificates.json
```json
{
  "id": 1,
  "title": "AWS Solutions Architect",
  "issuer": "Amazon Web Services",
  "issueDate": "2025-08",
  "expiryDate": "2028-08",
  "credentialId": "AWS-12345",
  "credentialUrl": "https://aws.amazon.com/verification",
  "description": "Professional level AWS certification",
  "certificatePdfUrl": "/assets/Certificates/AWS-Solutions-Architect.pdf"
}
```

### Step 3: Display in Component
```typescript
import { useCertificates } from "@/hooks/usePortfolioData";

export const CertificatesSection = () => {
  const { certificates } = useCertificates();

  return (
    <div>
      {certificates.map(cert => (
        <div key={cert.id}>
          <h3>{cert.title}</h3>
          <p>{cert.issuer}</p>
          
          {/* Download/View PDF Button */}
          {cert.certificatePdfUrl && (
            <a 
              href={cert.certificatePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              View Certificate PDF
            </a>
          )}
          
          {/* Or Open in Modal */}
          {cert.certificatePdfUrl && (
            <embed 
              src={cert.certificatePdfUrl} 
              type="application/pdf"
              width="100%"
              height="600px"
            />
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## 📝 Certificate Entry Template

```json
{
  "id": 5,
  "title": "Your Certificate Name",
  "issuer": "Issuing Organization",
  "issueDate": "2026-02",
  "expiryDate": "2029-02",
  "credentialId": "CERT-ID-123",
  "credentialUrl": "https://verify-url.com",
  "description": "What this certificate covers",
  "certificatePdfUrl": "/assets/Certificates/certificate-name.pdf"
}
```

---

## 🎯 File Naming Convention

**Format**: `{Organization}-{CertificateName}.pdf`

**Examples**:
- `AWS-Solutions-Architect.pdf`
- `GCP-Data-Engineer.pdf`
- `Google-Project-Management.pdf`
- `Coursera-React-Advanced.pdf`

---

## 🔧 Current Certificates Setup

All certificates now have PDF paths ready:

| Certificate | PDF Path |
|-------------|----------|
| AWS Solutions Architect | `/assets/Certificates/AWS-Solutions-Architect.pdf` |
| GCP Data Engineer | `/assets/Certificates/GCP-Data-Engineer.pdf` |
| React Advanced Patterns | `/assets/Certificates/React-Advanced-Patterns.pdf` |
| Node.js Mastery | `/assets/Certificates/Node-Mastery.pdf` |

---

## 💾 How to Add Your PDFs

1. **Get your certificate PDF** (download from issuing platform)
2. **Save to**: `public/assets/Certificates/`
3. **Update certificates.json** with the path
4. **Display in your component** (see example above)

---

## ✨ Display Options

### Option 1: Download Link
```typescript
<a href={cert.certificatePdfUrl} download className="btn">
  Download Certificate
</a>
```

### Option 2: View in Modal
```typescript
const [showPdf, setShowPdf] = useState(false);

return (
  <>
    <button onClick={() => setShowPdf(true)}>View PDF</button>
    {showPdf && (
      <Modal>
        <embed src={cert.certificatePdfUrl} type="application/pdf" />
      </Modal>
    )}
  </>
);
```

### Option 3: Inline Preview
```typescript
<embed 
  src={cert.certificatePdfUrl} 
  type="application/pdf"
  width="100%"
  height="600px"
/>
```

---

## 📊 JSON Structure

```json
[
  {
    "id": 1,
    "title": "AWS Solutions Architect",
    "issuer": "Amazon Web Services",
    "issueDate": "2025-08",
    "expiryDate": "2028-08",
    "credentialId": "AWS-12345",
    "credentialUrl": "https://aws.amazon.com/verification",
    "description": "Professional level AWS certification",
    "certificatePdfUrl": "/assets/Certificates/AWS-Solutions-Architect.pdf"
  }
]
```

---

## ✅ Implementation Checklist

- ✅ `certificatePdfUrl` field added to all certificates
- ✅ TypeScript interface updated in DataManager
- ✅ Field is optional (certificatePdfUrl?: string)
- ✅ Ready for component implementation

---

## 🎯 Next Steps

1. Create `/public/assets/Certificates/` folder
2. Add your certificate PDFs
3. Update `certificatePdfUrl` in certificates.json with actual paths
4. Implement display component
5. Test download/view functionality

---

**Done!** Your certificates now support PDF viewing! 📄
