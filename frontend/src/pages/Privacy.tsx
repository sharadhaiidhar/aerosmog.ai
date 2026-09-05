// pages/Privacy.tsx — Official Privacy Policy for Google Play Store compliance
import { Shield, Lock, Eye, MapPin, Camera, Mic, Trash2 } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="page space-y" style={{ maxWidth: 760, paddingBottom: 60 }}>
      <div className="flex-center gap-3" style={{ marginBottom: 12 }}>
        <div style={{ padding: 10, borderRadius: 12, background: 'var(--accent-bg)' }}>
          <Shield size={24} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
          <div className="text-xs text-muted">Last Updated: September 2026 • AeroSmog.AI</div>
        </div>
      </div>

      <div className="card space-y">
        <section>
          <h2 className="text-sm font-bold text-white mb-2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={16} className="text-accent" /> 1. Overview & Commitment
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            AeroSmog.AI ("we", "our", or "the App") is committed to protecting your personal privacy. This Privacy Policy outlines how your data is collected, handled, and safeguarded when using the AeroSmog.AI mobile application and web services. We do not sell your personal data to advertisers or third parties.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-white mb-2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} className="text-accent" /> 2. Location Data
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            AeroSmog.AI requests your precise or approximate geolocation (GPS coordinates and city) solely to fetch localized real-time atmospheric measurements, including Air Quality Index (AQI), PM2.5, PM10, UV index, and weather forecasts. Your location is transmitted over encrypted HTTPS to our backend to query Open-Meteo and WAQI sensor stations and is not used to track your travel history or identity.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-white mb-2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={16} className="text-accent" /> 3. Camera & AR Smog Vision
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            When you activate the optional <strong>AR Smog Vision</strong> feature, the app accesses your device's camera stream. This camera feed is rendered entirely on-device via HTML5 Canvas to overlay atmospheric particle simulations and real-time smog density HUD. <strong>No video feeds, images, or biometric photos are ever recorded, saved, or uploaded to any remote server.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-white mb-2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mic size={16} className="text-accent" /> 4. Microphone & Voice Doctor
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            The <strong>AI Voice Doctor</strong> feature utilizes browser Web Speech Synthesis and Speech Recognition to provide audible medical advice. Speech audio is processed using standard operating system speech engines and is never recorded, stored, or analyzed for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-white mb-2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={16} className="text-accent" /> 5. Health Profile Information
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            Users may optionally provide health profile details (such as asthma, respiratory sensitivity, age bracket, or outdoor work habits) to receive tailored AI health recommendations. This data is linked to an anonymous session identifier and is never shared with health insurers, brokers, or marketing networks.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-white mb-2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trash2 size={16} className="text-accent" /> 6. Data Deletion & User Rights
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            You may reset your session and clear all stored data at any time by clearing your browser or app cache, or by contacting our data protection officer at <strong>support@aerosmog.ai</strong> to request immediate deletion of any associated records.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-white mb-2">7. Contact Us</h2>
          <p className="text-xs text-muted leading-relaxed">
            If you have questions regarding this Privacy Policy or Google Play compliance, please reach out to:
            <br />
            <strong>AeroSmog.AI Privacy Team</strong>
            <br />
            Email: privacy@aerosmog.ai
            <br />
            Website: https://aerosmog-ai-2.onrender.com
          </p>
        </section>
      </div>
    </div>
  );
}
