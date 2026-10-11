import React from 'react';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>गोपनीयता नीति (Privacy Policy)</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
          अंतिम अद्यतन: अक्टूबर 2026 | HUNAR BHARAT KA
        </p>

        <section style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>1. डेटा संग्रह और उद्देश्य</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
            HUNAR BHARAT KA शेखावाटी (झुंझुनू, राजस्थान) के स्थानीय श्रमिकों को रोजगार प्रदाताओं से जोड़ने के लिए न्यूनतम आवश्यक जानकारी (जैसे नाम, मोबाइल नंबर, कार्य कौशल, अनुभव और ग्राम/कस्बा) एकत्र करता है।
          </p>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>2. संपर्क विवरण एवं गोपनीयता नियंत्रण</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
            प्रत्येक कारीगर को अपनी प्रोफ़ाइल में यह चुनने का पूर्ण अधिकार है कि वे अपना मोबाइल नंबर अथवा व्हाट्सएप नंबर सार्वजनिक रखना चाहते हैं या केवल अधिकृत व्यवस्थापक को उपलब्ध कराना चाहते हैं। आपके पासवर्ड और संवेदनशील डेटा एन्क्रिप्टेड (Hashed) रूप में सुरक्षित रहते हैं।
          </p>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>3. व्हाट्सएप सूचनाएं (WhatsApp Notifications)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
            हम केवल आपके स्पष्ट सहमति (Opt-in) के बाद ही नई नौकरियों और आवेदन की प्रगति के संबंध में व्हाट्सएप संदेश प्रेषित करते हैं। आप किसी भी समय अपनी प्रोफ़ाइल सेटिंग से इसे बंद (Opt-out) कर सकते हैं।
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>4. डेटा साझाकरण निषेध</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
            हम किसी भी तीसरे पक्ष या विज्ञापन एजेंसी को आपका व्यक्तिगत डेटा नहीं बेचते हैं। अधिक जानकारी के लिए help@hunarbharatka.in पर संपर्क करें।
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsConditions = () => {
  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>नियम और शर्तें (Terms & Conditions)</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
          लागू तिथि: अक्टूबर 2026 | HUNAR BHARAT KA
        </p>

        <section style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>1. कारीगर पात्रता एवं पंजीकरण</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
            पंजीकरण करते समय दी गई सभी जानकारी (नाम, कौशल, अनुभव) सत्य होनी चाहिए। असत्य या भ्रामक जानकारी पाए जाने पर व्यवस्थापक द्वारा खाता निलंबित (Suspend) किया जा सकता है।
          </p>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>2. नौकरी के लिए आवेदन एवं पारिश्रमिक</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
            पोर्टल पर प्रकाशित पारिश्रमिक दरें नियोक्ता द्वारा वास्तविक कार्य के आधार पर तय की जाती हैं। कारीगर और नियोक्ता के बीच आपसी सहमति से कार्य पूर्ण किया जाएगा। पोर्टल किसी भी प्रकार के मध्यस्थ दलाली शुल्क की मांग नहीं करता है।
          </p>
        </section>

        <section style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>3. समीक्षा एवं रेटिंग प्रणाली</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
            समीक्षाएं वास्तविक कार्य अनुभव पर आधारित होनी चाहिए। अपशब्द, अनुचित भाषा अथवा फर्जी समीक्षाओं को तुरंत हटाया जाएगा।
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>4. सेवा निष्पक्षता</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7' }}>
            HUNAR BHARAT KA मंच सभी वर्गों और समुदायों के कामगारों के लिए समान अवसर उपलब्ध कराने हेतु प्रतिबद्ध है।
          </p>
        </section>
      </div>
    </div>
  );
};

export const ContactHelp = () => {
  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 16px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>सहायता एवं संपर्क (Help & Support)</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          यदि आपको पंजीकरण, नौकरी खोजने या खाते से संबंधित कोई सहायता चाहिए, तो संपर्क करें:
        </p>

        <div className="grid-2" style={{ marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#FAFAFA', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '15px', marginBottom: '6px' }}>हेल्पलाइन मोबाइल नंबर</h4>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>+91 98765 43210</p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>प्रातः 9:00 से सायं 6:00 बजे तक</div>
          </div>

          <div style={{ backgroundColor: '#FAFAFA', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '15px', marginBottom: '6px' }}>आधिकारिक ईमेल</h4>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>help@hunarbharatka.in</p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>24 घंटे के भीतर उत्तर</div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>कार्यालय का पता</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            HUNAR BHARAT KA जिला सहायता केंद्र,<br />
            कलेक्ट्रेट रोड, मंडावा मोड़ के पास,<br />
            झुंझुनू (शेखावाटी), राजस्थान - 333001
          </p>
        </div>
      </div>
    </div>
  );
};

export const NotFound = () => {
  return (
    <div className="container" style={{ maxWidth: '500px', padding: '80px 16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '12px' }}>404</h1>
      <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>पृष्ठ नहीं मिला (Page Not Found)</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
        जो पृष्ठ आप खोज रहे हैं वह उपलब्ध नहीं है अथवा हटा दिया गया है।
      </p>
      <a href="/" className="btn btn-primary">
        मुख्य पृष्ठ पर लौटें
      </a>
    </div>
  );
};
