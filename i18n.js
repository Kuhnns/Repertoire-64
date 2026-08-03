export const LANGUAGES = [
  { code: "en", name: "English", direction: "ltr" },
  { code: "zh-CN", name: "简体中文", direction: "ltr" },
  { code: "hi", name: "हिन्दी", direction: "ltr" },
  { code: "es", name: "Español", direction: "ltr" },
  { code: "ar", name: "العربية", direction: "rtl" },
  { code: "fr", name: "Français", direction: "ltr" },
  { code: "bn", name: "বাংলা", direction: "ltr" },
  { code: "pt", name: "Português", direction: "ltr" },
  { code: "ru", name: "Русский", direction: "ltr" },
  { code: "ur", name: "اردو", direction: "rtl" },
  { code: "id", name: "Bahasa Indonesia", direction: "ltr" },
  { code: "de", name: "Deutsch", direction: "ltr" },
  { code: "ja", name: "日本語", direction: "ltr" },
  { code: "sw", name: "Kiswahili", direction: "ltr" },
  { code: "tr", name: "Türkçe", direction: "ltr" },
  { code: "ko", name: "한국어", direction: "ltr" },
];


export const MESSAGE_KEYS = [
  "language", "navCourses", "navPlans", "navTrainer", "navExtension", "optionalSignIn",
  "heroTitle1", "heroTitle2", "heroCopy", "username", "analyze", "reading",
  "freeWhite", "freeBlack", "premiumCourses", "library", "libraryTitle", "search",
  "all", "white", "black", "startingZero", "idea", "structure", "plan", "yourMove",
  "opponentResponse", "back", "restart", "safeHelp", "findReply", "extensionTitle",
  "download", "privacy", "progressLocal", "interfaceNote",
];


const MESSAGES = {
  en: [
    "Language", "Courses", "Free vs Premium", "Interactive trainer", "Chrome extension", "Optional sign in",
    "Stop memorizing moves.", "Understand the position.", "Free includes 150 opening courses, realistic move training, and private completed-game analysis with Stockfish 18 Lite. Premium expands the library to all 300 courses and adds deeper explanations.", "Chess.com username", "Analyze my Elo →", "Reading games…",
    "free White courses", "free Black courses", "courses in Premium", "THE FULL LIBRARY", "300 courses · 150 included free", "Search openings or ideas…",
    "All", "White", "Black", "STARTING FROM ZERO", "THE IDEA", "PAWN STRUCTURE", "YOUR PLAN", "YOUR MOVE",
    "OPPONENT RESPONSE", "← Back", "Restart line", "SAFE EXTRA HELP · OFFICIAL LICHESS TOOL", "Find the reply", "Every finished game becomes a lesson.",
    "Download Chrome extension (.zip) ↓", "Privacy", "Saved on this computer", "Interface translated; opening names, chess notation, and lesson text stay in their original chess-standard form.",
  ],
  "zh-CN": [
    "语言", "课程", "免费版与高级版", "互动训练", "Chrome 扩展程序", "可选登录",
    "别再死记棋步。", "理解局面。", "免费版包含 150 门开局课程、真实走法训练和使用 Stockfish 18 Lite 的私人赛后分析。高级版扩展到全部 300 门课程，并提供更深入的讲解。", "Chess.com 用户名", "分析我的等级分 →", "正在读取对局…",
    "门白方免费课程", "门黑方免费课程", "门高级课程", "完整课程库", "300 门课程 · 150 门免费", "搜索开局或思路…",
    "全部", "白方", "黑方", "从零开始", "核心思路", "兵形结构", "你的计划", "轮到你",
    "对手回应", "← 返回", "重新开始", "安全的额外帮助 · LICHESS 官方工具", "找出应对", "每盘结束的棋局都能成为一课。",
    "下载 Chrome 扩展程序（.zip）↓", "隐私", "已保存在此电脑", "界面已翻译；开局名称、棋谱记号和课程正文保留国际象棋标准形式。",
  ],
  hi: [
    "भाषा", "कोर्स", "मुफ़्त बनाम प्रीमियम", "इंटरैक्टिव ट्रेनर", "Chrome एक्सटेंशन", "वैकल्पिक साइन इन",
    "चालें रटना बंद करें।", "स्थिति को समझें।", "मुफ़्त संस्करण में 150 ओपनिंग कोर्स, वास्तविक चाल प्रशिक्षण और Stockfish 18 Lite से निजी पोस्ट-गेम विश्लेषण मिलता है। प्रीमियम में सभी 300 कोर्स और अधिक गहरी व्याख्याएँ मिलती हैं।", "Chess.com उपयोगकर्ता नाम", "मेरी Elo का विश्लेषण करें →", "गेम पढ़े जा रहे हैं…",
    "मुफ़्त सफ़ेद कोर्स", "मुफ़्त काले कोर्स", "प्रीमियम के कोर्स", "पूरी लाइब्रेरी", "300 कोर्स · 150 मुफ़्त", "ओपनिंग या विचार खोजें…",
    "सभी", "सफ़ेद", "काला", "बिल्कुल शुरुआत से", "विचार", "प्यादों की संरचना", "आपकी योजना", "आपकी चाल",
    "प्रतिद्वंद्वी की प्रतिक्रिया", "← पीछे", "लाइन फिर शुरू करें", "सुरक्षित अतिरिक्त मदद · आधिकारिक LICHESS टूल", "सही जवाब खोजें", "हर पूरी हुई बाज़ी एक पाठ बनती है।",
    "Chrome एक्सटेंशन डाउनलोड करें (.zip) ↓", "गोपनीयता", "इस कंप्यूटर पर सहेजा गया", "इंटरफ़ेस अनूदित है; ओपनिंग नाम, शतरंज नोटेशन और पाठ की सामग्री मानक रूप में रहती है।",
  ],
  es: [
    "Idioma", "Cursos", "Gratis vs Premium", "Entrenador interactivo", "Extensión de Chrome", "Inicio de sesión opcional",
    "Deja de memorizar jugadas.", "Comprende la posición.", "Gratis incluye 150 cursos de aperturas, entrenamiento realista y análisis privado de partidas terminadas con Stockfish 18 Lite. Premium amplía la biblioteca a 300 cursos y añade explicaciones más profundas.", "Usuario de Chess.com", "Analizar mi Elo →", "Leyendo partidas…",
    "cursos gratis con blancas", "cursos gratis con negras", "cursos en Premium", "LA BIBLIOTECA COMPLETA", "300 cursos · 150 gratis", "Buscar aperturas o ideas…",
    "Todos", "Blancas", "Negras", "DESDE CERO", "LA IDEA", "ESTRUCTURA DE PEONES", "TU PLAN", "TU JUGADA",
    "RESPUESTA DEL RIVAL", "← Atrás", "Reiniciar línea", "AYUDA SEGURA · HERRAMIENTA OFICIAL DE LICHESS", "Encontrar la respuesta", "Cada partida terminada se convierte en una lección.",
    "Descargar extensión de Chrome (.zip) ↓", "Privacidad", "Guardado en este ordenador", "La interfaz está traducida; los nombres de aperturas, la notación y el texto de las lecciones conservan su forma ajedrecística estándar.",
  ],
  ar: [
    "اللغة", "الدورات", "مجاني مقابل مميز", "مدرب تفاعلي", "إضافة Chrome", "تسجيل دخول اختياري",
    "توقف عن حفظ النقلات.", "افهم الوضعية.", "تشمل النسخة المجانية 150 دورة افتتاحيات وتدريباً واقعياً وتحليلاً خاصاً للمباريات المكتملة باستخدام Stockfish 18 Lite. توسع النسخة المميزة المكتبة إلى 300 دورة وتضيف شروحاً أعمق.", "اسم مستخدم Chess.com", "حلّل تصنيفي →", "جارٍ قراءة المباريات…",
    "دورة مجانية للأبيض", "دورة مجانية للأسود", "دورة في المميز", "المكتبة الكاملة", "300 دورة · 150 مجانية", "ابحث عن افتتاحيات أو أفكار…",
    "الكل", "الأبيض", "الأسود", "البدء من الصفر", "الفكرة", "بنية البيادق", "خطتك", "نقلتك",
    "رد الخصم", "رجوع →", "إعادة الخط", "مساعدة إضافية آمنة · أداة LICHESS الرسمية", "اعثر على الرد", "كل مباراة مكتملة تصبح درساً.",
    "تنزيل إضافة Chrome (.zip) ↓", "الخصوصية", "محفوظ على هذا الكمبيوتر", "تمت ترجمة الواجهة؛ تبقى أسماء الافتتاحيات وترميز الشطرنج ونصوص الدروس بصيغتها القياسية.",
  ],
  fr: [
    "Langue", "Cours", "Gratuit ou Premium", "Entraîneur interactif", "Extension Chrome", "Connexion facultative",
    "Arrêtez de mémoriser les coups.", "Comprenez la position.", "La version gratuite comprend 150 cours d’ouvertures, un entraînement réaliste et l’analyse privée des parties terminées avec Stockfish 18 Lite. Premium donne accès aux 300 cours et à des explications plus approfondies.", "Nom d’utilisateur Chess.com", "Analyser mon Elo →", "Lecture des parties…",
    "cours gratuits avec les Blancs", "cours gratuits avec les Noirs", "cours dans Premium", "LA BIBLIOTHÈQUE COMPLÈTE", "300 cours · 150 gratuits", "Rechercher une ouverture ou une idée…",
    "Tous", "Blancs", "Noirs", "PARTIR DE ZÉRO", "L’IDÉE", "STRUCTURE DE PIONS", "VOTRE PLAN", "À VOUS DE JOUER",
    "RÉPONSE ADVERSE", "← Retour", "Recommencer la ligne", "AIDE SÛRE · OUTIL OFFICIEL LICHESS", "Trouver la réponse", "Chaque partie terminée devient une leçon.",
    "Télécharger l’extension Chrome (.zip) ↓", "Confidentialité", "Enregistré sur cet ordinateur", "L’interface est traduite ; les noms d’ouvertures, la notation et le texte des leçons gardent leur forme échiquéenne standard.",
  ],
  bn: [
    "ভাষা", "কোর্স", "ফ্রি বনাম প্রিমিয়াম", "ইন্টার‌্যাক্টিভ ট্রেনার", "Chrome এক্সটেনশন", "ঐচ্ছিক সাইন ইন",
    "চাল মুখস্থ করা বন্ধ করুন।", "অবস্থানটি বুঝুন।", "ফ্রি সংস্করণে ১৫০টি ওপেনিং কোর্স, বাস্তবসম্মত চালের অনুশীলন এবং Stockfish 18 Lite দিয়ে ব্যক্তিগত ম্যাচ-পরবর্তী বিশ্লেষণ আছে। প্রিমিয়ামে সব ৩০০টি কোর্স ও আরও গভীর ব্যাখ্যা রয়েছে।", "Chess.com ব্যবহারকারীর নাম", "আমার Elo বিশ্লেষণ করুন →", "গেম পড়া হচ্ছে…",
    "ফ্রি সাদা কোর্স", "ফ্রি কালো কোর্স", "প্রিমিয়াম কোর্স", "সম্পূর্ণ লাইব্রেরি", "৩০০ কোর্স · ১৫০ ফ্রি", "ওপেনিং বা ধারণা খুঁজুন…",
    "সব", "সাদা", "কালো", "শূন্য থেকে শুরু", "মূল ধারণা", "পনের গঠন", "আপনার পরিকল্পনা", "আপনার চাল",
    "প্রতিপক্ষের জবাব", "← পেছনে", "লাইন আবার শুরু", "নিরাপদ অতিরিক্ত সহায়তা · অফিসিয়াল LICHESS টুল", "জবাব খুঁজুন", "প্রতিটি শেষ হওয়া গেম একটি পাঠ হয়ে ওঠে।",
    "Chrome এক্সটেনশন ডাউনলোড করুন (.zip) ↓", "গোপনীয়তা", "এই কম্পিউটারে সংরক্ষিত", "ইন্টারফেস অনূদিত; ওপেনিং নাম, দাবার নোটেশন ও পাঠের লেখা মানক রূপে থাকে।",
  ],
  pt: [
    "Idioma", "Cursos", "Grátis vs Premium", "Treinador interativo", "Extensão do Chrome", "Entrar é opcional",
    "Pare de decorar lances.", "Entenda a posição.", "O plano grátis inclui 150 cursos de aberturas, treino realista e análise privada de partidas concluídas com Stockfish 18 Lite. O Premium amplia a biblioteca para 300 cursos e acrescenta explicações mais profundas.", "Usuário do Chess.com", "Analisar meu Elo →", "Lendo partidas…",
    "cursos grátis de Brancas", "cursos grátis de Pretas", "cursos no Premium", "BIBLIOTECA COMPLETA", "300 cursos · 150 grátis", "Buscar aberturas ou ideias…",
    "Todos", "Brancas", "Pretas", "COMEÇANDO DO ZERO", "A IDEIA", "ESTRUTURA DE PEÕES", "SEU PLANO", "SUA VEZ",
    "RESPOSTA DO ADVERSÁRIO", "← Voltar", "Reiniciar linha", "AJUDA SEGURA · FERRAMENTA OFICIAL DO LICHESS", "Encontrar a resposta", "Cada partida concluída vira uma lição.",
    "Baixar extensão do Chrome (.zip) ↓", "Privacidade", "Salvo neste computador", "A interface está traduzida; nomes de aberturas, notação e texto das lições permanecem no formato padrão do xadrez.",
  ],
  ru: [
    "Язык", "Курсы", "Бесплатно и Premium", "Интерактивный тренажёр", "Расширение Chrome", "Необязательный вход",
    "Перестаньте заучивать ходы.", "Понимайте позицию.", "Бесплатная версия включает 150 курсов по дебютам, реалистичную тренировку и приватный анализ завершённых партий со Stockfish 18 Lite. Premium открывает все 300 курсов и более глубокие объяснения.", "Имя пользователя Chess.com", "Проанализировать мой Elo →", "Читаем партии…",
    "бесплатных курсов за белых", "бесплатных курсов за чёрных", "курсов в Premium", "ПОЛНАЯ БИБЛИОТЕКА", "300 курсов · 150 бесплатно", "Поиск дебютов или идей…",
    "Все", "Белые", "Чёрные", "С САМОГО НАЧАЛА", "ИДЕЯ", "ПЕШЕЧНАЯ СТРУКТУРА", "ВАШ ПЛАН", "ВАШ ХОД",
    "ОТВЕТ СОПЕРНИКА", "← Назад", "Начать вариант заново", "БЕЗОПАСНАЯ ПОМОЩЬ · ОФИЦИАЛЬНЫЙ ИНСТРУМЕНТ LICHESS", "Найти ответ", "Каждая завершённая партия становится уроком.",
    "Скачать расширение Chrome (.zip) ↓", "Конфиденциальность", "Сохранено на этом компьютере", "Интерфейс переведён; названия дебютов, нотация и текст уроков остаются в стандартной шахматной форме.",
  ],
  ur: [
    "زبان", "کورس", "مفت بمقابلہ پریمیم", "انٹرایکٹو ٹرینر", "Chrome ایکسٹینشن", "اختیاری سائن اِن",
    "چالیں رٹنا بند کریں۔", "پوزیشن کو سمجھیں۔", "مفت ورژن میں 150 اوپننگ کورس، حقیقت پسندانہ مشق اور Stockfish 18 Lite کے ساتھ مکمل گیمز کا نجی تجزیہ شامل ہے۔ پریمیم میں تمام 300 کورس اور زیادہ گہری وضاحتیں ملتی ہیں۔", "Chess.com صارف نام", "میری Elo کا تجزیہ کریں →", "گیمز پڑھی جا رہی ہیں…",
    "سفید کے مفت کورس", "سیاہ کے مفت کورس", "پریمیم کورس", "مکمل لائبریری", "300 کورس · 150 مفت", "اوپننگ یا خیال تلاش کریں…",
    "سب", "سفید", "سیاہ", "صفر سے آغاز", "خیال", "پیادوں کی ساخت", "آپ کا منصوبہ", "آپ کی چال",
    "مخالف کا جواب", "واپس →", "لائن دوبارہ شروع کریں", "محفوظ اضافی مدد · سرکاری LICHESS ٹول", "جواب تلاش کریں", "ہر مکمل گیم ایک سبق بن جاتی ہے۔",
    "Chrome ایکسٹینشن ڈاؤن لوڈ کریں (.zip) ↓", "رازداری", "اس کمپیوٹر پر محفوظ", "انٹرفیس کا ترجمہ کیا گیا ہے؛ اوپننگ کے نام، شطرنج نوٹیشن اور سبق کا متن معیاری شکل میں رہتا ہے۔",
  ],
  id: [
    "Bahasa", "Kursus", "Gratis vs Premium", "Pelatih interaktif", "Ekstensi Chrome", "Masuk opsional",
    "Berhenti menghafal langkah.", "Pahami posisinya.", "Versi Gratis mencakup 150 kursus pembukaan, latihan langkah realistis, dan analisis privat setelah permainan dengan Stockfish 18 Lite. Premium membuka seluruh 300 kursus dan penjelasan yang lebih mendalam.", "Nama pengguna Chess.com", "Analisis Elo saya →", "Membaca permainan…",
    "kursus Putih gratis", "kursus Hitam gratis", "kursus di Premium", "PERPUSTAKAAN LENGKAP", "300 kursus · 150 gratis", "Cari pembukaan atau ide…",
    "Semua", "Putih", "Hitam", "MULAI DARI NOL", "IDE", "STRUKTUR BIDAK", "RENCANA ANDA", "LANGKAH ANDA",
    "JAWABAN LAWAN", "← Kembali", "Mulai ulang variasi", "BANTUAN AMAN · ALAT RESMI LICHESS", "Temukan jawaban", "Setiap permainan yang selesai menjadi pelajaran.",
    "Unduh ekstensi Chrome (.zip) ↓", "Privasi", "Tersimpan di komputer ini", "Antarmuka diterjemahkan; nama pembukaan, notasi catur, dan teks pelajaran tetap memakai bentuk standar catur.",
  ],
  de: [
    "Sprache", "Kurse", "Kostenlos vs Premium", "Interaktiver Trainer", "Chrome-Erweiterung", "Optionale Anmeldung",
    "Hör auf, Züge auswendig zu lernen.", "Verstehe die Stellung.", "Kostenlos enthält 150 Eröffnungskurse, realistisches Zugtraining und private Analysen beendeter Partien mit Stockfish 18 Lite. Premium erweitert die Bibliothek auf 300 Kurse und bietet tiefere Erklärungen.", "Chess.com-Benutzername", "Mein Elo analysieren →", "Partien werden gelesen…",
    "kostenlose Weiß-Kurse", "kostenlose Schwarz-Kurse", "Kurse in Premium", "DIE GESAMTE BIBLIOTHEK", "300 Kurse · 150 kostenlos", "Eröffnungen oder Ideen suchen…",
    "Alle", "Weiß", "Schwarz", "BEI NULL ANFANGEN", "DIE IDEE", "BAUERNSTRUKTUR", "DEIN PLAN", "DEIN ZUG",
    "ANTWORT DES GEGNERS", "← Zurück", "Variante neu starten", "SICHERE ZUSATZHILFE · OFFIZIELLES LICHESS-TOOL", "Antwort finden", "Jede beendete Partie wird zu einer Lektion.",
    "Chrome-Erweiterung herunterladen (.zip) ↓", "Datenschutz", "Auf diesem Computer gespeichert", "Die Oberfläche ist übersetzt; Eröffnungsnamen, Schachnotation und Lektionstexte bleiben in ihrer Standardschachform.",
  ],
  ja: [
    "言語", "コース", "無料版とPremium", "インタラクティブ・トレーナー", "Chrome 拡張機能", "任意でログイン",
    "手順の丸暗記をやめよう。", "局面を理解しよう。", "無料版には150のオープニング講座、実戦的な手のトレーニング、Stockfish 18 Liteによる終了後の非公開分析が含まれます。Premiumでは全300講座と、より深い解説を利用できます。", "Chess.com ユーザー名", "Eloを分析 →", "対局を読み込み中…",
    "白の無料コース", "黒の無料コース", "Premiumのコース", "全コースライブラリ", "300コース · 150無料", "オープニングやアイデアを検索…",
    "すべて", "白", "黒", "ゼロから始める", "基本アイデア", "ポーン構造", "あなたのプラン", "あなたの手番",
    "相手の応手", "← 戻る", "ラインをやり直す", "安全な追加ヘルプ · LICHESS公式ツール", "応手を見つける", "終了した対局をすべてレッスンに。",
    "Chrome 拡張機能をダウンロード（.zip）↓", "プライバシー", "このコンピューターに保存済み", "画面は翻訳済みです。オープニング名、棋譜表記、レッスン本文はチェスの標準形式を保ちます。",
  ],
  sw: [
    "Lugha", "Kozi", "Bure dhidi ya Premium", "Mkufunzi shirikishi", "Kiendelezi cha Chrome", "Kuingia ni hiari",
    "Acha kukariri hatua.", "Elewa nafasi.", "Toleo la bure lina kozi 150 za ufunguzi, mazoezi halisi na uchambuzi binafsi wa michezo iliyokamilika kwa Stockfish 18 Lite. Premium hufungua kozi zote 300 na maelezo ya kina zaidi.", "Jina la mtumiaji la Chess.com", "Changanua Elo yangu →", "Inasoma michezo…",
    "kozi za bure za Weupe", "kozi za bure za Weusi", "kozi za Premium", "MAKTABA KAMILI", "Kozi 300 · 150 bure", "Tafuta ufunguzi au wazo…",
    "Zote", "Weupe", "Weusi", "ANZA KUTOKA SIFURI", "WAZO", "MUUNDO WA PIONI", "MPANGO WAKO", "ZAMU YAKO",
    "JIBU LA MPINZANI", "← Nyuma", "Anza mstari upya", "MSAADA SALAMA · ZANA RASMI YA LICHESS", "Tafuta jibu", "Kila mchezo uliokamilika huwa somo.",
    "Pakua kiendelezi cha Chrome (.zip) ↓", "Faragha", "Imehifadhiwa kwenye kompyuta hii", "Kiolesura kimetafsiriwa; majina ya ufunguzi, noti za chess na maandishi ya somo hubaki katika mfumo wa kawaida.",
  ],
  tr: [
    "Dil", "Kurslar", "Ücretsiz ve Premium", "Etkileşimli antrenör", "Chrome uzantısı", "İsteğe bağlı giriş",
    "Hamle ezberlemeyi bırakın.", "Konumu anlayın.", "Ücretsiz sürüm 150 açılış kursu, gerçekçi hamle antrenmanı ve Stockfish 18 Lite ile tamamlanmış oyunların özel analizini içerir. Premium tüm 300 kursu ve daha derin açıklamaları açar.", "Chess.com kullanıcı adı", "Elo’mu analiz et →", "Oyunlar okunuyor…",
    "ücretsiz Beyaz kursu", "ücretsiz Siyah kursu", "Premium kursu", "TÜM KÜTÜPHANE", "300 kurs · 150 ücretsiz", "Açılış veya fikir ara…",
    "Tümü", "Beyaz", "Siyah", "SIFIRDAN BAŞLA", "FİKİR", "PİYON YAPISI", "PLANINIZ", "SIRA SİZDE",
    "RAKİBİN YANITI", "← Geri", "Varyantı yeniden başlat", "GÜVENLİ EK YARDIM · RESMİ LICHESS ARACI", "Yanıtı bul", "Tamamlanan her oyun bir derse dönüşür.",
    "Chrome uzantısını indir (.zip) ↓", "Gizlilik", "Bu bilgisayara kaydedildi", "Arayüz çevrilmiştir; açılış adları, satranç notasyonu ve ders metni standart satranç biçiminde kalır.",
  ],
  ko: [
    "언어", "코스", "무료와 Premium", "인터랙티브 트레이너", "Chrome 확장 프로그램", "선택 로그인",
    "수순 암기를 멈추세요.", "포지션을 이해하세요.", "무료 버전에는 150개 오프닝 코스, 실전형 수 훈련, Stockfish 18 Lite를 이용한 종료된 게임의 비공개 분석이 포함됩니다. Premium은 전체 300개 코스와 더 깊은 설명을 제공합니다.", "Chess.com 사용자 이름", "내 Elo 분석 →", "게임을 읽는 중…",
    "무료 백 코스", "무료 흑 코스", "Premium 코스", "전체 라이브러리", "300개 코스 · 150개 무료", "오프닝 또는 아이디어 검색…",
    "전체", "백", "흑", "처음부터 시작", "핵심 아이디어", "폰 구조", "나의 계획", "나의 차례",
    "상대의 응수", "← 뒤로", "라인 다시 시작", "안전한 추가 도움 · LICHESS 공식 도구", "응수 찾기", "끝난 모든 게임이 하나의 레슨이 됩니다.",
    "Chrome 확장 프로그램 다운로드 (.zip) ↓", "개인정보 보호", "이 컴퓨터에 저장됨", "인터페이스는 번역되며 오프닝 이름, 체스 기보, 레슨 본문은 표준 체스 형식을 유지합니다.",
  ],
};

const indexByKey = new Map(MESSAGE_KEYS.map((key, index) => [key, index]));

export function isLocale(value) {
  return LANGUAGES.some((language) => language.code === value);
}

export function resolveLocale(value) {
  if (!value) return "en";
  const normalized = value.toLowerCase();
  const exact = LANGUAGES.find((language) => language.code.toLowerCase() === normalized);
  if (exact) return exact.code;
  const base = normalized.split("-")[0];
  return LANGUAGES.find((language) => language.code.toLowerCase().split("-")[0] === base)?.code || "en";
}

export function localeDirection(locale) {
  return LANGUAGES.find((language) => language.code === locale)?.direction || "ltr";
}

export function t(locale, key) {
  const index = indexByKey.get(key);
  if (index === undefined) return key;
  return MESSAGES[locale]?.[index] || MESSAGES.en[index] || key;
}


export const LOCALE_STORAGE_KEY = "repertoire64-locale-v1";

export function initializeLocalization() {
  let stored = null;
  try {
    stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    stored = null;
  }
  let locale = isLocale(stored) ? stored : resolveLocale(navigator.language);
  const selector = document.querySelector("#language-select");

  function apply(nextLocale) {
    locale = isLocale(nextLocale) ? nextLocale : "en";
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDirection(locale);
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(locale, element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(locale, element.dataset.i18nPlaceholder));
    });
    if (selector) {
      selector.value = locale;
      selector.setAttribute("aria-label", t(locale, "language"));
      selector.title = t(locale, "language");
    }
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // A blocked preference write must never break the site.
    }
    document.dispatchEvent(new CustomEvent("repertoire64:locale", { detail: { locale } }));
  }

  if (selector) {
    const fragment = document.createDocumentFragment();
    for (const language of LANGUAGES) {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = language.name;
      fragment.append(option);
    }
    selector.replaceChildren(fragment);
    selector.addEventListener("change", () => apply(selector.value));
  }

  apply(locale);
  return {
    get locale() {
      return locale;
    },
    translate(key) {
      return t(locale, key);
    },
  };
}

