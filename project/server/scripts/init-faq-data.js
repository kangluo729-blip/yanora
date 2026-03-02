import { pool } from '../config/database.js';

const initFAQData = async () => {
  try {
    console.log('开始初始化FAQ数据...');

    const categoryResult = await pool.query(
      `INSERT INTO faq_categories (name_zh, name_en, name_fr, name_ar, name_es, display_order)
       VALUES
       ('常规问题', 'General Questions', 'Questions Générales', 'أسئلة عامة', 'Preguntas Generales', 1),
       ('安全相关', 'Safety Related', 'Lié à la Sécurité', 'متعلق بالسلامة', 'Relacionado con Seguridad', 2),
       ('恢复相关', 'Recovery Related', 'Lié à la Récupération', 'متعلق بالتعافي', 'Relacionado con Recuperación', 3),
       ('费用相关', 'Cost Related', 'Lié aux Coûts', 'متعلق بالتكلفة', 'Relacionado con Costo', 4)
       RETURNING id, name_zh`
    );

    const categories = categoryResult.rows;
    console.log(`已创建 ${categories.length} 个分类`);

    const safetyCategory = categories.find(c => c.name_zh === '安全相关');
    const recoveryCategory = categories.find(c => c.name_zh === '恢复相关');
    const costCategory = categories.find(c => c.name_zh === '费用相关');

    await pool.query(
      `INSERT INTO faqs (
        category_id,
        question_zh, question_en, question_fr, question_ar, question_es,
        answer_zh, answer_en, answer_fr, answer_ar, answer_es,
        display_order
      ) VALUES
      (
        $1,
        '整形手术安全吗？',
        'Is cosmetic surgery safe?',
        'La chirurgie esthétique est-elle sûre?',
        'هل الجراحة التجميلية آمنة؟',
        '¿Es segura la cirugía estética?',
        '我们采用国际先进的设备和材料，由经验丰富的医师团队操作，确保手术的安全性。所有手术都在符合标准的医疗环境中进行。',
        'We use internationally advanced equipment and materials, operated by experienced medical teams, ensuring surgical safety. All surgeries are performed in standard-compliant medical environments.',
        'Nous utilisons des équipements et matériaux de pointe, opérés par des équipes médicales expérimentées, garantissant la sécurité chirurgicale.',
        'نستخدم معدات ومواد متطورة، يديرها فرق طبية ذات خبرة، مما يضمن السلامة الجراحية.',
        'Utilizamos equipos y materiales avanzados, operados por equipos médicos experimentados, garantizando la seguridad quirúrgica.',
        1
      ),
      (
        $2,
        '恢复期需要多长时间？',
        'How long is the recovery period?',
        'Combien de temps dure la période de récupération?',
        'كم تستغرق فترة التعافي؟',
        '¿Cuánto dura el período de recuperación?',
        '恢复时间因手术类型而异。微创手术如注射类项目几乎无恢复期，手术类项目通常需要1-2周。我们会为您提供详细的术后护理指导。',
        'Recovery time varies by surgery type. Minimally invasive procedures have almost no downtime, surgical procedures typically require 1-2 weeks. We provide detailed post-operative care guidance.',
        'Le temps de récupération varie selon le type de chirurgie. Les procédures mini-invasives n ont presque pas de temps d arrêt, les procédures chirurgicales nécessitent généralement 1-2 semaines.',
        'يختلف وقت التعافي حسب نوع الجراحة. الإجراءات البسيطة ليس لها تقريباً وقت توقف، الإجراءات الجراحية تتطلب عادة 1-2 أسابيع.',
        'El tiempo de recuperación varía según el tipo de cirugía. Los procedimientos mínimamente invasivos casi no tienen tiempo de inactividad, los procedimientos quirúrgicos típicamente requieren 1-2 semanas.',
        1
      ),
      (
        $3,
        '费用如何计算？',
        'How are costs calculated?',
        'Comment les coûts sont-ils calculés?',
        'كيف يتم حساب التكاليف؟',
        '¿Cómo se calculan los costos?',
        '费用根据具体项目和个人情况而定。我们会在详细面诊后，为您提供透明的报价方案。我们承诺没有任何隐藏费用。',
        'Costs depend on specific procedures and individual circumstances. We provide transparent pricing after consultation. We promise no hidden fees.',
        'Les coûts dépendent des procédures spécifiques et des circonstances individuelles. Nous fournissons des prix transparents après consultation.',
        'تعتمد التكاليف على الإجراءات المحددة والظروف الفردية. نقدم أسعاراً شفافة بعد الاستشارة.',
        'Los costos dependen de procedimientos específicos y circunstancias individuales. Proporcionamos precios transparentes después de la consulta.',
        1
      )`,
      [safetyCategory?.id, recoveryCategory?.id, costCategory?.id]
    );

    console.log('FAQ示例数据初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('初始化FAQ数据失败:', error);
    process.exit(1);
  }
};

initFAQData();
