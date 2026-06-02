import transporter from '../config/mailer.js'

export async function sendNotificationEmail(email, stationName, claimToken) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const claimUrl = frontendUrl + '/claim/' + claimToken
  const skipUrl = frontendUrl + '/skip/' + claimToken

  await transporter.sendMail({
    from: '"Ather Queue" <' + process.env.SMTP_USER + '>',
    to: email,
    subject: '⚡ Your turn at ' + stationName,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #18181b; color: #fff; border-radius: 16px;">
        <h1 style="color: #22c55e; margin-bottom: 8px;">⚡ Charger Available!</h1>
        <p style="color: #a1a1aa;">A charger is now available at</p>
        <h2 style="color: #fff; margin-top: 4px;">${stationName}</h2>
        <p style="color: #a1a1aa;">You have <strong style="color: #fff;">5 minutes</strong> to claim your spot before it passes to the next person.</p>

        <a href="${claimUrl}"
          style="display: block; background: #22c55e; color: #fff; text-align: center; padding: 16px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 24px 0;">
          ⚡ I am on my way
        </a>

        <a href="${skipUrl}"
          style="display: block; background: #3f3f46; color: #a1a1aa; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-size: 14px;">
          Skip my turn
        </a>

        <p style="color: #52525b; font-size: 12px; margin-top: 24px; text-align: center;">
          Ather Queue — Smart charging companion for Ather riders
        </p>
      </div>
    `
  })

  console.log('Notification email sent to:', email)
}