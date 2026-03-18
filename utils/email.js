export async function sendEmail(toAddress, doctor) {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    if (!apiKey) {
        console.error("No Resend API key found! Please add VITE_RESEND_API_KEY to your .env file.");
        return false;
    }

    try {
        const patientEmailData = {
            from: 'AI Front Desk <onboarding@resend.dev>',
            to: [toAddress],
            subject: 'Hospital Appointment Confirmation',
            html: `
                <h2>Your Appointment is Confirmed!</h2>
                <p>Hello,</p>
                <p>Your appointment has been successfully booked with <strong>${doctor.name}</strong> (${doctor.department}).</p>
                <p><strong>Time:</strong> ${doctor.available}</p>
                <br/>
                <p>Thank you,</p>
                <p>AI Voice Receptionist</p>
            `
        };

        const doctorEmailData = {
            from: 'AI Front Desk <onboarding@resend.dev>',
            to: [doctor.email],
            subject: 'New Patient Appointment Scheduled',
            html: `
                <h2>New Appointment Alert</h2>
                <p>Hello ${doctor.name},</p>
                <p>A new patient has been scheduled for a consultation regarding <strong>${doctor.department}</strong>.</p>
                <p><strong>Time:</strong> ${doctor.available}</p>
                <p><strong>Patient Contact:</strong> ${toAddress}</p>
                <br/>
                <p>AI Front Desk System</p>
            `
        };

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };

        // Fire both emails in parallel via our proxy
        const [patientRes, doctorRes] = await Promise.all([
            fetch('/api/resend', { method: 'POST', headers, body: JSON.stringify(patientEmailData) }),
            fetch('/api/resend', { method: 'POST', headers, body: JSON.stringify(doctorEmailData) })
        ]);

        if (patientRes.ok && doctorRes.ok) {
            console.log("Both Patient and Doctor emails sent successfully!");
            return true;
        } else {
            const patientErr = patientRes.ok ? null : await patientRes.json();
            const doctorErr = doctorRes.ok ? null : await doctorRes.json();
            
            console.error("Failed Emails. Patient:", patientErr, "Doctor:", doctorErr);
            
            // Check for Resend Sandbox Limitation
            if ((patientErr && patientErr.statusCode === 403) || (doctorErr && doctorErr.statusCode === 403)) {
                alert("🚨 Resend API Blocked Send: Because you are using a free unverified domain (onboarding@resend.dev), Resend strictly dictates you can ONLY send emails to the exact email address you used to register your Resend account! Retry but type that specific email into the AI instead.");
            } else {
                alert("Failed to send email. Check browser console for Resend API errors.");
            }
            return false;
        }
    } catch (e) {
        console.error("Email API network error:", e);
        return false;
    }
}
