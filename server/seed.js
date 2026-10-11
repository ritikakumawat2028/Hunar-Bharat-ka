const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for HUNAR BHARAT KA...');

  // 1. Categories
  const categoriesData = [
    { nameHi: 'प्लंबर (नलसाज)', nameEn: 'Plumber', descriptionHi: 'पानी के नल, पाइप और फिटिंग का काम' },
    { nameHi: 'टाइल व पत्थर मिस्त्री', nameEn: 'Tile & Marble Mason', descriptionHi: 'फर्श व दीवारों पर टाइल और पत्थर लगाने का काम' },
    { nameHi: 'इलेक्ट्रिशियन (बिजली मिस्त्री)', nameEn: 'Electrician', descriptionHi: 'बिजली वायरिंग, पंखे व स्विच रिपेयर' },
    { nameHi: 'पेंटर (रंग-रोगन)', nameEn: 'Painter', descriptionHi: 'मकान, दुकान व पुट्टी रंगाई का काम' },
    { nameHi: 'बढ़ई (कारपेंटर)', nameEn: 'Carpenter', descriptionHi: 'फर्नीचर, दरवाजे और खिड़की का काम' },
    { nameHi: 'राजमिस्त्री (चिनाई)', nameEn: 'Mason (Rajmistri)', descriptionHi: 'ईंट, सीमेंट और प्लास्टर चिनाई का काम' },
    { nameHi: 'वेल्डर / फैब्रिकेटर', nameEn: 'Welder / Fabricator', descriptionHi: 'लोहे के गेट, ग्रिल और वेल्डिंग का काम' },
    { nameHi: 'मजदूर / सहायक', nameEn: 'Helper / Labor', descriptionHi: 'दैनिक निर्माण व लोडिंग सहायक कार्य' }
  ];

  for (const cat of categoriesData) {
    const existing = await prisma.jobCategory.findFirst({ where: { nameEn: cat.nameEn } });
    if (!existing) {
      await prisma.jobCategory.create({ data: cat });
    }
  }

  // 2. Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  let admin = await prisma.user.findUnique({ where: { phone: '9876543210' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        role: 'ADMIN',
        name: 'जिला समन्वयक (Admin)',
        phone: '9876543210',
        email: 'admin@hunarbharatka.in',
        passwordHash: adminPasswordHash,
        language: 'en',
        villageOrTown: 'Jhunjhunu City',
        city: 'Jhunjhunu',
        district: 'Jhunjhunu',
        state: 'Rajasthan',
        pincode: '333001',
        isVerified: true
      }
    });
    console.log('Created admin account: 9876543210 / admin123');
  }

  // 3. Worker User
  const workerPasswordHash = await bcrypt.hash('worker123', 10);
  let worker = await prisma.user.findUnique({ where: { phone: '9829012345' } });
  const plumberCat = await prisma.jobCategory.findFirst({ where: { nameEn: 'Plumber' } });

  if (!worker) {
    worker = await prisma.user.create({
      data: {
        workerId: 'HBK-1001',
        role: 'WORKER',
        name: 'सुरेश कुमार जांगिड़',
        phone: '9829012345',
        whatsappNumber: '9829012345',
        email: 'suresh.jangid@hunarbharatka.in',
        passwordHash: workerPasswordHash,
        categoryId: plumberCat ? plumberCat.id : null,
        skills: 'पाइप फिटिंग, लीकेज रिपेयर, मोटर कनेक्शन, बाथरूम सैनिटरी',
        experience: '7 वर्ष',
        bio: 'शेखावाटी क्षेत्र में 7 वर्षों से विश्वसनीय और गुणवत्तापूर्ण प्लंबिंग कार्य का अनुभव। आपातकालीन लीकेज और नए निर्माण की पूरी फिटिंग।',
        villageOrTown: 'मंडावा मोड़',
        city: 'Jhunjhunu',
        district: 'Jhunjhunu',
        state: 'Rajasthan',
        pincode: '333001',
        availability: 'AVAILABLE',
        isVerified: true,
        verificationNote: 'आधार कार्ड व स्थानीय सत्यापन पूर्ण',
        isPublicProfile: true,
        showPhonePublic: true,
        showWhatsappPublic: true,
        whatsappOptIn: true
      }
    });
    console.log('Created sample worker: 9829012345 (HBK-1001) / worker123');
  }

  // 4. Sample Jobs
  const tileCat = await prisma.jobCategory.findFirst({ where: { nameEn: 'Tile & Marble Mason' } });
  const elecCat = await prisma.jobCategory.findFirst({ where: { nameEn: 'Electrician' } });

  const existingJobs = await prisma.job.count();
  if (existingJobs === 0) {
    const job1 = await prisma.job.create({
      data: {
        titleHi: 'आवासीय कॉलोनी में पाइपलाइन और सैनिटरी फिटिंग कार्य',
        titleEn: 'Residential Pipeline & Sanitary Fitting Work',
        descriptionHi: 'दो मंजिला नए मकान में संपूर्ण पीवीसी पाइपलाइन बिछाने और 3 बाथरूम में सैनिटरी नल फिटिंग का कार्य तुरंत चाहिए।',
        descriptionEn: 'Complete PVC pipeline fitting and 3 bathrooms sanitary installation in newly constructed house.',
        categoryId: plumberCat.id,
        address: 'रोड नंबर 2, मंडावा बाईपास',
        area: 'मंडावा बाईपास',
        city: 'Jhunjhunu',
        district: 'Jhunjhunu',
        state: 'Rajasthan',
        pincode: '333001',
        jobDate: '15-10-2026',
        startTime: '09:00 AM',
        duration: '3 दिन',
        deadline: '2026-10-20',
        employmentType: 'Daily Wage',
        payment: '₹850 / दिन',
        workersRequired: 2,
        requiredSkills: 'पाइपलाइन, सीपीवीसी फिटिंग, लीकेज टेस्टिंग',
        requiredExp: '3+ वर्ष',
        employerName: 'रामनिवास शर्मा',
        employerContact: '9414055555',
        status: 'PUBLISHED',
        createdBy: admin.id
      }
    });

    if (tileCat) {
      await prisma.job.create({
        data: {
          titleHi: 'दुकान में फ्लोर टाइल और स्कर्टिंग लगाने का काम',
          titleEn: 'Shop Floor Tile and Skirting Installation',
          descriptionHi: 'बाजार में 400 वर्ग फुट की दुकान में विट्रीफाइड फ्लोर टाइल लगाने के लिए अनुभवी कारीगर की आवश्यकता।',
          descriptionEn: 'Experienced mason needed for 400 sq.ft vitrified floor tile installation in market shop.',
          categoryId: tileCat.id,
          address: 'नेहरू बाजार, मुख्य डाकघर के पास',
          city: 'Nawalgarh',
          district: 'Jhunjhunu',
          state: 'Rajasthan',
          pincode: '333042',
          jobDate: '18-10-2026',
          startTime: '08:30 AM',
          duration: '2 दिन',
          deadline: '2026-10-25',
          employmentType: 'Contract',
          payment: '₹18 / वर्ग फुट (लगभग ₹7,200 कुल)',
          workersRequired: 1,
          requiredSkills: 'फ्लोर टाइल कटिंग, लेवेलिंग, ग्राउटिंग',
          requiredExp: '5+ वर्ष',
          employerName: 'गोपाल जी अग्रवाल',
          employerContact: '9828011223',
          status: 'PUBLISHED',
          createdBy: admin.id
        }
      });
    }

    if (elecCat) {
      await prisma.job.create({
        data: {
          titleHi: 'गोदाम में कंसील्ड वायरिंग व एमसीबी बोर्ड इंस्टालेशन',
          titleEn: 'Warehouse Concealed Wiring & MCB Installation',
          descriptionHi: 'नए वेयरहाउस में 3-फेज वायरिंग, लाइटिंग पॉइंट्स और मेन डिस्ट्रीब्यूशन बोर्ड लगाने का कार्य।',
          descriptionEn: 'Installation of 3-phase commercial wiring, light points and distribution board.',
          categoryId: elecCat.id,
          address: 'रीको इंडस्ट्रियल एरिया',
          city: 'Jhunjhunu',
          district: 'Jhunjhunu',
          state: 'Rajasthan',
          pincode: '333001',
          jobDate: '20-10-2026',
          startTime: '09:30 AM',
          duration: '4 दिन',
          deadline: '2026-10-28',
          employmentType: 'Daily Wage',
          payment: '₹900 / दिन',
          workersRequired: 2,
          requiredSkills: 'कंसील्ड वायरिंग, 3-फेज कनेक्शन, एमसीबी',
          requiredExp: '4+ वर्ष',
          employerName: 'विकास चौधरी',
          employerContact: '9783044112',
          status: 'PUBLISHED',
          createdBy: admin.id
        }
      });
    }

    // Worker applied to job1
    if (worker && job1) {
      await prisma.jobApplication.create({
        data: {
          jobId: job1.id,
          userId: worker.id,
          status: 'Applied',
          workerSnapshot: JSON.stringify({
            name: worker.name,
            phone: worker.phone,
            workerId: worker.workerId,
            skills: worker.skills,
            experience: worker.experience,
            city: worker.city
          })
        }
      });
    }
  }

  // 5. Sample Review for worker
  if (worker && admin) {
    const revCount = await prisma.review.count({ where: { workerId: worker.id } });
    if (revCount === 0) {
      await prisma.review.create({
        data: {
          workerId: worker.id,
          authorId: admin.id,
          rating: 5,
          comment: 'सुरेश जी ने समय पर आकर बहुत ही सफाई और मजबूती से पाइपलाइन का काम किया। व्यवहार बहुत विनम्र है।',
          isVerifiedJob: true,
          isModerated: true
        }
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
