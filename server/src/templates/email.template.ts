
interface EmailTemplateInput {
  title: string
  message: string
  code?: string
  footer?: string
}
const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[char]
  })

export const createEmailTemplate = ({
  title,
  message,
  code,
  footer = 'This is an automated email from TaskForge.',
}: EmailTemplateInput): string => {
  return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:30px;background:#f4f6fb;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:auto;background:#ffffff;padding:35px;border-radius:12px;">
          <h1 style="color:#3730a3;text-align:center;">TaskForge</h1>

          <h2 style="color:#1e293b;">${escapeHtml(title)}</h2>

          <p style="color:#475569;line-height:1.7;">${escapeHtml(message)}</p>

          ${
            code
              ? `<div style="margin:25px 0;padding:18px;background:#eef2ff;text-align:center;border-radius:8px;">
                  <h1 style="letter-spacing:8px;color:#3730a3;margin:0;">${escapeHtml(code)}</h1>
                </div>`
              : ''
          }

          <p style="color:#64748b;font-size:13px;line-height:1.6;">${escapeHtml(footer)}</p>

          <hr style="border:0;border-top:1px solid #e2e8f0;margin:25px 0;" />

          <p style="color:#94a3b8;font-size:12px;text-align:center;">
            © ${new Date().getFullYear()} TaskForge
          </p>
        </div>
      </body>
    </html>
  `
}
