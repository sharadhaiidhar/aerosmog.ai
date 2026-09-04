// pages/Profile.tsx — plain CSS version
import { useState, useEffect } from 'react';
import { User, Save, CheckCircle } from 'lucide-react';
import { getSessionId } from '../utils/session';
import { getProfile, createProfile, updateProfile, getProfileOptions } from '../api/client';

const LABELS: Record<string, string> = {
  child: 'Child (0–12)', teen: 'Teen (13–17)', adult: 'Adult (18–59)', senior: 'Senior (60+)',
  none: 'No condition', asthma: 'Asthma', copd: 'COPD', heart_disease: 'Heart Disease',
  diabetes: 'Diabetes', pregnancy: 'Pregnancy', allergies: 'Allergies',
  indoor_worker: 'Indoor Worker', outdoor_worker: 'Outdoor Worker',
  athlete: 'Athlete', student: 'Student', retired: 'Retired', other: 'Other',
};

export default function Profile() {
  const sessionId = getSessionId();
  const [opts, setOpts] = useState<any>({ age_groups: [], health_conditions: [], occupations: [] });
  const [form, setForm] = useState({ name: '', age_group: 'adult', health_condition: 'none', occupation: 'indoor_worker' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    getProfileOptions().then(setOpts);
    getProfile(sessionId).then(p => {
      if (p) {
        setForm({ name: p.name ?? '', age_group: p.age_group, health_condition: p.health_condition, occupation: p.occupation });
        setIsNew(false);
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { session_id: sessionId, ...form, name: form.name || null };
      if (isNew) { await createProfile(payload); setIsNew(false); }
      else { await updateProfile(sessionId, payload); }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Save failed — is the backend running?'); }
    setSaving(false);
  };

  return (
    <div className="page-sm space-y">
      <div className="flex-center gap-3">
        <div style={{ padding: 10, borderRadius: 12, background: 'var(--accent-bg)' }}>
          <User size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Health Profile</h1>
          <p className="text-xs text-muted">Personalizes your AI advisory</p>
        </div>
      </div>

      <div className="card space-y">
        {/* Name */}
        <div>
          <label>Name (optional)</label>
          <input type="text" placeholder="Your name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        {/* Age Group */}
        <div>
          <label>Age Group</label>
          <select value={form.age_group} onChange={e => setForm(f => ({ ...f, age_group: e.target.value }))}>
            {opts.age_groups.map((o: string) => <option key={o} value={o}>{LABELS[o] ?? o}</option>)}
          </select>
        </div>
        {/* Health Condition */}
        <div>
          <label>Health Condition</label>
          <select value={form.health_condition} onChange={e => setForm(f => ({ ...f, health_condition: e.target.value }))}>
            {opts.health_conditions.map((o: string) => <option key={o} value={o}>{LABELS[o] ?? o}</option>)}
          </select>
        </div>
        {/* Occupation */}
        <div>
          <label>Occupation</label>
          <select value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))}>
            {opts.occupations.map((o: string) => <option key={o} value={o}>{LABELS[o] ?? o}</option>)}
          </select>
        </div>

        <button
          className={`btn btn-full ${saved ? 'btn-green' : 'btn-primary'}`}
          onClick={handleSave} disabled={saving}
        >
          {saved ? <><CheckCircle size={15} /> Saved!</>
               : saving ? 'Saving...'
               : <><Save size={15} /> Save Profile</>}
        </button>
      </div>

      <div className="card" style={{ borderColor: 'rgba(79,163,224,0.2)' }}>
        <p className="text-sm text-muted mb-2">Your profile generates <strong className="text-accent">personalized</strong> advisories:</p>
        <ul className="text-xs text-muted">
          <li>Asthma patients get inhaler reminders on high AQI days</li>
          <li>Outdoor workers get mask recommendations</li>
          <li>Children & seniors get elevated risk alerts</li>
          <li>Pregnant individuals get extra caution advisories</li>
        </ul>
      </div>
    </div>
  );
}
