# n8n Workflows for StayKedarnath

This folder contains ready-to-import n8n workflow files.

## 📥 How to Import

1. Open n8n at http://localhost:5678
2. Go to **Workflows** → **Import from File**
3. Select any `.json` file from this folder
4. Click **Import**

## 🔧 Setup Required

Before workflows work, you need to configure credentials in n8n:

### 1. Supabase Credentials
- Go to n8n → **Credentials** → **Add credential** → **Supabase**
- Enter your Supabase URL: `https://your-project.supabase.co`
- Enter your Service Role Key (from Supabase Dashboard → Settings → API)

### 2. Telegram Bot
- Open Telegram, search for `@BotFather`
- Send `/newbot` and follow instructions
- Copy the API token
- Go to n8n → **Credentials** → **Add credential** → **Telegram**
- Paste your bot token
- To get your Chat ID: Search `@userinfobot` and start it

### 3. Update Workflows
After importing, edit each workflow and:
- Replace `REPLACE_WITH_YOUR_CREDENTIAL_ID` with your credential
- Replace `REPLACE_WITH_YOUR_TELEGRAM_CHAT_ID` with your chat ID

## 📋 Workflow Descriptions

### 01-new-lead-notification.json
**Trigger:** Webhook (POST to `/new-lead`)
**Flow:** Website form → Save to Supabase → Notify you on Telegram

### 02-daily-summary-report.json
**Trigger:** Every day at 8 AM
**Flow:** Query yesterday's leads & bookings → Send summary to Telegram

### 03-followup-reminder.json
**Trigger:** Every 4 hours
**Flow:** Find leads without response for 24h+ → Remind you on Telegram

### 04-payment-confirmation.json
**Trigger:** Webhook (POST to `/payment-success`)
**Flow:** Razorpay payment → Update booking status → Notify on Telegram

## 🌐 Webhook URLs (After Activating)

Your webhooks will be available at:
- New Lead: `http://localhost:5678/webhook/new-lead`
- Payment: `http://localhost:5678/webhook/payment-success`

For production, use your n8n domain or ngrok tunnel.
