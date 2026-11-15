import { Language, OrderStatus, ProductAudience, ProductAvailability, ProductCategory } from '../types';

export const COPY: Record<
  Language,
  {
    nav: {
      catalog: string;
      delivery: string;
      about: string;
      admin: string;
      cart: string;
    };
    hero: {
      eyebrow: string;
      headline: string;
      subheadline: string;
      ctaPrimary: string;
      ctaSecondary: string;
      stats: { label: string; value: string }[];
    };
    catalog: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      categoryLabel: string;
      audienceLabel: string;
      sizeLabel: string;
      allSizes: string;
      sortNewest: string;
      sortPriceAsc: string;
      sortPriceDesc: string;
      resetFilters: string;
      emptyTitle: string;
      emptyDesc: string;
      countUnit: string;
      selectSize: string;
      addToCart: string;
      quickView: string;
    };
    categories: Record<ProductCategory, string>;
    audiences: Record<ProductAudience, string>;
    availability: Record<ProductAvailability, string>;
    delivery: {
      eyebrow: string;
      title: string;
      subtitle: string;
      steps: { num: string; title: string; desc: string }[];
      paymentCardTitle: string;
      paymentCardDesc: string;
      copyNumber: string;
      copied: string;
      whatsappBtn: string;
      instagramLabel: string;
    };
    cart: {
      title: string;
      empty: string;
      emptySub: string;
      size: string;
      subtotalLabel: string;
      deliveryNote: string;
      nameLabel: string;
      phoneLabel: string;
      deliveryMethodLabel: string;
      methodAtyrau: string;
      methodPost: string;
      cityLabel: string;
      addressLabel: string;
      commentLabel: string;
      kaspiTitle: string;
      kaspiStep1: string;
      kaspiStep2: string;
      submitOrder: string;
      submitting: string;
      orderSuccessTitle: string;
      orderSuccessDesc: string;
      sendWhatsapp: string;
      close: string;
    };
    pdp: {
      origin: string;
      selectSizePrompt: string;
      deliveryHint: string;
      addedToast: string;
      orderWhatsappDirect: string;
    };
    orderStatuses: Record<OrderStatus, string>;
    footer: {
      tagline: string;
      contactsTitle: string;
      termsTitle: string;
      termsLine1: string;
      termsLine2: string;
      adminEntry: string;
      rights: string;
    };
  }
> = {
  ru: {
    nav: {
      catalog: 'Каталог',
      delivery: 'Оплата и доставка',
      about: 'О нас',
      admin: 'Админка',
      cart: 'Корзина',
    },
    hero: {
      eyebrow: 'Стамбул · Атырау · Весь Казахстан',
      headline: 'Одежда и обувь напрямую из Турции на заказ',
      subheadline:
        'Отборные коллекции из Стамбула: верхняя одежда, костюмы, обувь из натуральной кожи и сумки. Более 5 лет на онлайн-заказах. Сначала оплачиваете товар на Kaspi, доставку — после получения.',
      ctaPrimary: 'Выбрать в каталоге',
      ctaSecondary: 'Условия заказа',
      stats: [
        { value: '5+ лет', label: 'опыта в онлайн-заказах' },
        { value: 'Стамбул', label: 'прямой выкуп с фабрик' },
        { value: '2 этапа', label: 'товар сейчас · доставка при получении' },
        { value: 'РК / Атырау', label: 'курьер и отправка почтой' },
      ],
    },
    catalog: {
      title: 'Коллекция из Турции',
      subtitle: 'Актуальные модели с прямым выкупом из Стамбула. Выберите категорию и нужный размер.',
      searchPlaceholder: 'Поиск по названию или описанию...',
      categoryLabel: 'Категория',
      audienceLabel: 'Раздел',
      sizeLabel: 'Размер',
      allSizes: 'Все размеры',
      sortNewest: 'Сначала новинки',
      sortPriceAsc: 'Сначала дешевле',
      sortPriceDesc: 'Сначала дороже',
      resetFilters: 'Сбросить фильтры',
      emptyTitle: 'По выбранным фильтрам товаров пока нет',
      emptyDesc: 'Попробуйте выбрать другой размер, категорию или сбросить фильтры.',
      countUnit: 'моделей',
      selectSize: 'Выберите размер',
      addToCart: 'В корзину',
      quickView: 'Подробнее',
    },
    categories: {
      all: 'Все',
      clothing: 'Одежда',
      footwear: 'Обувь',
      outerwear: 'Верхняя одежда',
      accessories: 'Сумки и аксессуары',
    },
    audiences: {
      all: 'Для всех',
      women: 'Женское',
      men: 'Мужское',
      kids: 'Детское',
    },
    availability: {
      preorder_istanbul: 'Под заказ · Стамбул',
      in_stock_atyrau: 'В наличии · Атырау',
    },
    delivery: {
      eyebrow: 'Прозрачные условия Drop Shipping',
      title: 'Как проходит заказ из Стамбула',
      subtitle:
        'Работаю более 5 лет на товарке и онлайн-заказах. Честные условия без скрытых комиссий: стоимость товара и доставка оплачиваются раздельно.',
      steps: [
        {
          num: '01',
          title: 'Выбор модели и размера',
          desc: 'Выбираете одежду, обувь или аксессуары в каталоге, указываете нужный размер и оформляете заявку на сайте или через WhatsApp.',
        },
        {
          num: '02',
          title: 'Оплата товара на Kaspi',
          desc: 'На первом этапе оплачивается только стоимость товара переводом на Kaspi по номеру 87022024120. После подтверждения сразу выкупаю заказ в Стамбуле.',
        },
        {
          num: '03',
          title: 'Доставка из Стамбула (2-й этап)',
          desc: 'Обратите внимание: сейчас вы оплачиваете только сам товар. Доставку из Стамбула в Алматы / Атырау и другие города РК нужно будет оплатить отдельно, когда посылка прибудет — по её точному весу и тарифу вашего города.',
        },
      ],
      paymentCardTitle: 'Оплата на Kaspi и связь в WhatsApp',
      paymentCardDesc:
        'Переводы принимаются на Kaspi по единому номеру. После перевода отправьте чек в WhatsApp для подтверждения выкупа.',
      copyNumber: 'Скопировать номер',
      copied: 'Номер скопирован',
      whatsappBtn: 'Написать в WhatsApp',
      instagramLabel: 'Новинки и живые обзоры в Instagram',
    },
    cart: {
      title: 'Корзина и оформление',
      empty: 'Ваша корзина пуста',
      emptySub: 'Выберите понравившуюся одежду или обувь из каталога.',
      size: 'Размер',
      subtotalLabel: 'Итого за товар',
      deliveryNote:
        'Обратите внимание: сейчас вы оплачиваете только сам товар. Доставку из Стамбула в Алматы / Атырау нужно будет оплатить отдельно, когда посылка прибудет — по её точному весу и тарифу вашего города.',
      nameLabel: 'Ваше имя',
      phoneLabel: 'Номер WhatsApp / Kaspi',
      deliveryMethodLabel: 'Способ получения',
      methodAtyrau: 'По городу Атырау',
      methodPost: 'Почта по Казахстану (за счёт клиента)',
      cityLabel: 'Город / Населённый пункт',
      addressLabel: 'Адрес или отделение почты',
      commentLabel: 'Комментарий к заказу (по желанию)',
      kaspiTitle: 'Оплата на Kaspi: 87022024120',
      kaspiStep1: '1. Сейчас вы оплачиваете только сам товар на Kaspi 87022024120.',
      kaspiStep2:
        '2. Доставку из Стамбула в Алматы / Атырау нужно будет оплатить отдельно, когда посылка прибудет — по её точному весу и тарифу вашего города.',
      submitOrder: 'Оформить заказ',
      submitting: 'Отправка...',
      orderSuccessTitle: 'Заказ оформлен',
      orderSuccessDesc: 'Отправьте детали заказа в WhatsApp и приложите чек об оплате товара на Kaspi 87022024120.',
      sendWhatsapp: 'Отправить заказ в WhatsApp',
      close: 'Продолжить покупки',
    },
    pdp: {
      origin: 'Происхождение',
      selectSizePrompt: 'Выберите размер',
      deliveryHint:
        'Сейчас вы оплачиваете только сам товар (Kaspi 87022024120). Доставку из Стамбула нужно будет оплатить отдельно при прибытии — по точному весу и тарифу вашего города.',
      addedToast: 'Добавлено в корзину',
      orderWhatsappDirect: 'Заказать через WhatsApp',
    },
    orderStatuses: {
      new: 'Новый',
      goods_paid: 'Товар оплачен',
      purchased_istanbul: 'Выкуплен в Стамбуле',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
    },
    footer: {
      tagline: 'Прямые заказы одежды, обуви и аксессуаров из Турции (Стамбул). Более 5 лет надёжной работы.',
      contactsTitle: 'Контакты и оплата',
      termsTitle: 'Доставка и расчёт',
      termsLine1: '1-й этап: сейчас вы оплачиваете только сам товар на Kaspi 87022024120',
      termsLine2:
        '2-й этап: доставка из Стамбула оплачивается отдельно при прибытии — по точному весу и тарифу вашего города',
      adminEntry: 'Вход для администратора',
      rights: 'ASSEMOK · Стамбул — Атырау',
    },
  },
  kk: {
    nav: {
      catalog: 'Каталог',
      delivery: 'Төлем және жеткізу',
      about: 'Біз туралы',
      admin: 'Админ',
      cart: 'Себет',
    },
    hero: {
      eyebrow: 'Ыстамбұл · Атырау · Бүкіл Қазақстан',
      headline: 'Түркиядан тапсырыспен киім және аяқ киім',
      subheadline:
        'Ыстамбұлдан тікелей сатып алу: сырт киім, костюмдер, табиғи теріден аяқ киім мен сөмкелер. Онлайн тапсырыс нарығында 5 жылдан астам тәжірибе. Алдымен тауар ақысы Kaspi-ге төленеді, жеткізу ақысы — тауарды алған соң.',
      ctaPrimary: 'Каталогты қарау',
      ctaSecondary: 'Тапсырыс шарттары',
      stats: [
        { value: '5+ жыл', label: 'онлайн саудадағы тәжірибе' },
        { value: 'Ыстамбұл', label: 'фабрикадан тікелей выкуп' },
        { value: '2 кезең', label: 'тауар алдымен · жеткізу алған соң' },
        { value: 'ҚР / Атырау', label: 'қала іші және пошта арқылы' },
      ],
    },
    catalog: {
      title: 'Түркия топтамасы',
      subtitle: 'Ыстамбұлдан тікелей тапсырысқа қолжетімді үлгілер. Санат пен өлшемді таңдаңыз.',
      searchPlaceholder: 'Атауы бойынша іздеу...',
      categoryLabel: 'Санат',
      audienceLabel: 'Бөлім',
      sizeLabel: 'Өлшем',
      allSizes: 'Барлық өлшем',
      sortNewest: 'Жаңа тауарлар',
      sortPriceAsc: 'Арзанынан бастап',
      sortPriceDesc: 'Қымбатынан бастап',
      resetFilters: 'Сүзгіні тазалау',
      emptyTitle: 'Таңдалған сүзгі бойынша тауар табылмады',
      emptyDesc: 'Басқа өлшемді немесе санатты таңдап көріңіз.',
      countUnit: 'үлгі',
      selectSize: 'Өлшемді таңдаңыз',
      addToCart: 'Себетке қосу',
      quickView: 'Толығырақ',
    },
    categories: {
      all: 'Барлығы',
      clothing: 'Киім',
      footwear: 'Аяқ киім',
      outerwear: 'Сырт киім',
      accessories: 'Сөмкелер мен аксессуарлар',
    },
    audiences: {
      all: 'Барлығына',
      women: 'Әйелдерге',
      men: 'Ерлерге',
      kids: 'Балаларға',
    },
    availability: {
      preorder_istanbul: 'Тапсырыспен · Ыстамбұл',
      in_stock_atyrau: 'Қоймада бар · Атырау',
    },
    delivery: {
      eyebrow: 'Drop Shipping шарттары',
      title: 'Ыстамбұлдан тапсырыс беру тәртібі',
      subtitle:
        'Онлайн тапсырыс саласында 5 жылдан астам тәжірибе. Тауар мен жеткізу ақысы бөлек төленеді.',
      steps: [
        {
          num: '01',
          title: 'Үлгі мен өлшемді таңдау',
          desc: 'Каталогтан киім немесе аяқ киім таңдап, өлшемін белгілеп сайтта немесе WhatsApp арқылы тапсырыс беріңіз.',
        },
        {
          num: '02',
          title: 'Тауар ақысын Kaspi-ге төлеу',
          desc: 'Бірінші кезеңде тек тауардың құны 87022024120 Kaspi нөміріне төленеді. Төлем расталған соң Ыстамбұлдан бірден сатып алынады.',
        },
        {
          num: '03',
          title: 'Ыстамбұлдан жеткізу (2-кезең)',
          desc: 'Назар аударыңыз: қазір сіз тек тауардың өзін төлейсіз. Ыстамбұлдан Алматы / Атырау және ҚР басқа қалаларына жеткізу ақысы сәлемдеме келгенде — нақты салмағы мен қалаңыздың тарифі бойынша бөлек төленеді.',
        },
      ],
      paymentCardTitle: 'Kaspi төлем және WhatsApp байланыс',
      paymentCardDesc:
        'Төлем Kaspi арқылы 87022024120 нөміріне қабылданады. Төлеген соң чекті WhatsApp-қа жіберіңіз.',
      copyNumber: 'Нөмірді көшіру',
      copied: 'Нөмір көшірілді',
      whatsappBtn: 'WhatsApp-қа жазу',
      instagramLabel: 'Instagram парақшадағы жаңалықтар',
    },
    cart: {
      title: 'Себет және тапсырыс',
      empty: 'Себет бос тұр',
      emptySub: 'Каталогтан ұнаған киім немесе аяқ киімді таңдаңыз.',
      size: 'Өлшемі',
      subtotalLabel: 'Тауар сомасы',
      deliveryNote:
        'Назар аударыңыз: қазір сіз тек тауардың өзін төлейсіз. Ыстамбұлдан жеткізу ақысы сәлемдеме келгенде — нақты салмағы мен қалаңыздың тарифі бойынша бөлек төленеді.',
      nameLabel: 'Аты-жөніңіз',
      phoneLabel: 'WhatsApp / Kaspi нөміріңіз',
      deliveryMethodLabel: 'Жеткізу тәсілі',
      methodAtyrau: 'Атырау қаласы бойынша',
      methodPost: 'Қазақстан бойынша пошта (клиент есебінен)',
      cityLabel: 'Қала / Елді мекен',
      addressLabel: 'Мекенжай немесе пошта бөлімшесі',
      commentLabel: 'Түсініктеме (міндетті емес)',
      kaspiTitle: 'Kaspi төлем: 87022024120',
      kaspiStep1: '1. Қазір сіз тек тауардың өзін Kaspi 87022024120 нөміріне төлейсіз.',
      kaspiStep2:
        '2. Ыстамбұлдан Алматы / Атырауға жеткізу ақысы сәлемдеме келгенде — нақты салмағы мен қалаңыздың тарифі бойынша бөлек төленеді.',
      submitOrder: 'Тапсырысты рәсімдеу',
      submitting: 'Жіберілуде...',
      orderSuccessTitle: 'Тапсырыс қабылданды',
      orderSuccessDesc: 'Тапсырысты WhatsApp-қа жіберіп, Kaspi 87022024120 нөміріне төленген чекті қоса жолдаңыз.',
      sendWhatsapp: 'WhatsApp-қа жіберу',
      close: 'Сатып алуды жалғастыру',
    },
    pdp: {
      origin: 'Шығу тегі',
      selectSizePrompt: 'Өлшемді таңдаңыз',
      deliveryHint:
        'Қазір сіз тек тауардың өзін төлейсіз (Kaspi 87022024120). Ыстамбұлдан жеткізу сәлемдеме келгенде нақты салмағы мен қалаңыздың тарифі бойынша бөлек төленеді.',
      addedToast: 'Себетке қосылды',
      orderWhatsappDirect: 'WhatsApp арқылы тапсырыс беру',
    },
    orderStatuses: {
      new: 'Жаңа',
      goods_paid: 'Тауар төленді',
      purchased_istanbul: 'Ыстамбұлда сатып алынды',
      shipped: 'Жөнелтілді',
      delivered: 'Жеткізілді',
      cancelled: 'Бас тартылды',
    },
    footer: {
      tagline: 'Түркиядан (Ыстамбұл) тікелей тапсырыспен киім, аяқ киім және аксессуарлар. 5 жылдан астам сенімді жұмыс.',
      contactsTitle: 'Байланыс және төлем',
      termsTitle: 'Жеткізу және төлем тәртібі',
      termsLine1: '1-кезең: қазір тек тауардың өзі Kaspi 87022024120 нөміріне төленеді',
      termsLine2:
        '2-кезең: Ыстамбұлдан жеткізу сәлемдеме келгенде — нақты салмағы мен қала тарифі бойынша бөлек төленеді',
      adminEntry: 'Әкімші кіруі',
      rights: 'ASSEMOK · Ыстамбұл — Атырау',
    },
  },
};
