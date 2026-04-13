// ================================
// FILE: backend/services/scheduler.js
// ================================
const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');

const initScheduler = () => {
  // Run every hour at the 0th minute to check for due reminders
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 [Cron] Running Reminder Dispatcher...');
      
      const now = new Date();
      // Find all pending reminders where the due date is in the past (or exactly now)
      const dueReminders = await Reminder.find({
        status: 'pending',
        dueDate: { $lte: now }
      }).populate('userId');

      if (dueReminders.length === 0) {
        console.log('🔄 [Cron] No pending reminders to dispatch.');
        return;
      }

      for (const reminder of dueReminders) {
        // Logic to dispatch: E.g., Socket.io emit, SendGrid email, or Twilio SMS
        const user = reminder.userId;
        
        let sent = false;
        if (user.notificationPreferences?.email) {
          console.log(`✉️ [Mock Email] Sending to ${user.email}: ${reminder.title}`);
          sent = true;
        }
        if (user.notificationPreferences?.sms && user.phone) {
          console.log(`📱 [Mock SMS] Sending to ${user.phone}: ${reminder.title}`);
          sent = true;
        }

        // Output simple push to console if neither is checked
        if (!sent) {
          console.log(`🔔 [Mock System Push] Dispatching to ${user.name}: ${reminder.title}`);
        }

        // Mark as sent
        reminder.status = 'sent';
        await reminder.save();
      }

      console.log(`✅ [Cron] Dispatched ${dueReminders.length} reminders successfully.`);
    } catch (error) {
      console.error('❌ [Cron] Error running reminder dispatcher:', error);
    }
  });

  console.log('⏳ [Scheduler] Cron Jobs initialized!');
};

module.exports = { initScheduler };
