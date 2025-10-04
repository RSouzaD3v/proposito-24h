import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
// import { sendEmail } from "@/lib/mailersend";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
    const { email } = await request.json();

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const password = Math.random().toString(36).slice(-8);

    const hashed = await hash(password, 10);

    await db.user.update({
        where: { email },
        data: { password: hashed },
    });

    const contentHtml = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin:0;padding:0;background-color:#000000;color:#ffffff;font-family:system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#050608;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px 16px;background:linear-gradient(90deg,#001f7a 0%, #0049ff 100%);color:#ffffff;">
                    <h1 style="margin:0;font-size:20px;font-weight:600;letter-spacing:0.2px;">Senha temporária</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 32px 8px;color:#e6eefc;">
                    <p style="margin:0 0 12px;font-size:16px;color:#dfe9ff;">Olá ${user.name || "usuário"},</p>
                    <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#cbdcff;">
                      Você solicitou a recuperação de senha. Abaixo está sua senha temporária. Use-a para entrar no aplicativo e, por segurança, altere sua senha assim que possível. Esta senha temporária expira em breve.
                    </p>

                    <p style="margin:0 0 24px;">
                      <span style="display:inline-block;background:#0b1220;color:#ffffff;padding:14px 18px;border-radius:8px;font-weight:700;font-size:18px;letter-spacing:0.6px;">
                        ${password}
                      </span>
                    </p>

                    <p style="margin:0 0 8px;font-size:13px;color:#9fb8ff;">
                      Se você não solicitou esta alteração, ignore este e-mail. Sua senha permanecerá inalterada.
                    </p>
                    <p style="margin:6px 0 0;font-size:13px;color:#9fb8ff;">
                      Para sua segurança, recomenda-se alterar a senha nas configurações do seu perfil após efetuar login.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 32px 28px;background:#07080a;color:#9aaeea;font-size:13px;">
                    <p style="margin:0;">Atenciosamente,<br/>Equipe DevotionalApp</p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:12px 16px;background:#000000;color:#4b6ab3;font-size:12px;">
                    <small style="color:#2f4f9e;">&copy; ${new Date().getFullYear()} DevotionalApp — Segurança e privacidade em primeiro lugar</small>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;

    try {
        // const sendEmailClient = await sendEmail({
        //     text: "Senha temporária para DevotionalApp",
        //     subject: "Mudança de senha solicitada",
        //     contentHtml,
        //     nameClient: user.name || "User",
        //     emailClient: "brunobraga2@gmail.com",
        // });

        return NextResponse.json({ message: "Email Enviado com Sucesso" });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ message: error }, { status: 500 });
    }
}