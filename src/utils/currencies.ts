import { getDefaultCurrency, getDefaultLanguage } from "./consts";

type CurrencyData = {
    symbol: string;
    name: string;
    decimals: number;
};

const currencySymbols: Record<string, CurrencyData> = {
    AED: { symbol: "د.إ", name: "Dirham de los Emiratos Árabes Unidos", decimals: 2 },
    AFN: { symbol: "؋", name: "Afghani afgano", decimals: 2 },
    ALL: { symbol: "L", name: "Lek albanés", decimals: 2 },
    AMD: { symbol: "֏", name: "Dram armenio", decimals: 2 },
    ANG: { symbol: "ƒ", name: "Florín de las Antillas Neerlandesas", decimals: 2 },
    AOA: { symbol: "Kz", name: "Kwanza angoleño", decimals: 2 },
    ARS: { symbol: "$", name: "Peso argentino", decimals: 2 },
    AUD: { symbol: "A$", name: "Dólar australiano", decimals: 2 },
    AWG: { symbol: "ƒ", name: "Florín arubeño", decimals: 2 },
    AZN: { symbol: "₼", name: "Manat azerbaiyano", decimals: 2 },
    BAM: { symbol: "KM", name: "Marco convertible", decimals: 2 },
    BBD: { symbol: "Bds$", name: "Dólar de Barbados", decimals: 2 },
    BDT: { symbol: "৳", name: "Taka bangladesí", decimals: 2 },
    BGN: { symbol: "лв", name: "Lev búlgaro", decimals: 2 },
    BHD: { symbol: ".د.ب", name: "Dinar bahreiní", decimals: 3 },
    BIF: { symbol: "FBu", name: "Franco burundés", decimals: 0 },
    BMD: { symbol: "BD$", name: "Dólar bermudeño", decimals: 2 },
    BND: { symbol: "B$", name: "Dólar de Brunéi", decimals: 2 },
    BOB: { symbol: "Bs.", name: "Boliviano", decimals: 2 },
    BOV: { symbol: "Mvdol", name: "MVDOL", decimals: 2 },
    BRL: { symbol: "R$", name: "Real brasileño", decimals: 2 },
    BSD: { symbol: "B$", name: "Dólar bahameño", decimals: 2 },
    BTN: { symbol: "Nu.", name: "Ngultrum butanés", decimals: 2 },
    BWP: { symbol: "P", name: "Pula botsuano", decimals: 2 },
    BYN: { symbol: "Br", name: "Rublo bielorruso", decimals: 2 },
    BZD: { symbol: "BZ$", name: "Dólar beliceño", decimals: 2 },
    CAD: { symbol: "C$", name: "Dólar canadiense", decimals: 2 },
    CDF: { symbol: "₣", name: "Franco congoleño", decimals: 2 },
    CHE: { symbol: "CHE", name: "Euro WIR", decimals: 2 },
    CHF: { symbol: "₣", name: "Franco suizo", decimals: 2 },
    CHW: { symbol: "CHW", name: "Franco WIR", decimals: 2 },
    CLF: { symbol: "CLF", name: "Unidad de Fomento", decimals: 4 },
    CLP: { symbol: "$", name: "Peso chileno", decimals: 0 },
    CNY: { symbol: "¥", name: "Yuan chino", decimals: 2 },
    COP: { symbol: "$", name: "Peso colombiano", decimals: 2 },
    COU: { symbol: "COU", name: "Unidad de Valor Real", decimals: 2 },
    CRC: { symbol: "₡", name: "Colón costarricense", decimals: 2 },
    CUP: { symbol: "₱", name: "Peso Cubano", decimals: 2 },
    CVE: { symbol: "$", name: "Escudo caboverdiano", decimals: 2 },
    CZK: { symbol: "Kč", name: "Corona checa", decimals: 2 },
    DJF: { symbol: "₣", name: "Franco yibutiano", decimals: 0 },
    DKK: { symbol: "kr", name: "Corona danesa", decimals: 2 },
    DOP: { symbol: "RD$", name: "Peso dominicano", decimals: 2 },
    DZD: { symbol: "د.ج", name: "Dinar argelino", decimals: 2 },
    EGP: { symbol: "£", name: "Libra egipcia", decimals: 2 },
    ERN: { symbol: "Nfk", name: "Nakfa", decimals: 2 },
    ETB: { symbol: "Br", name: "Birr etíope", decimals: 2 },
    EUR: { symbol: "€", name: "Euro", decimals: 2 },
    FJD: { symbol: "$", name: "Dólar fiyiano", decimals: 2 },
    FKP: { symbol: "£", name: "Libra malvinense", decimals: 2 },
    GBP: { symbol: "£", name: "Libra esterlina", decimals: 2 },
    GEL: { symbol: "ლ", name: "Lari", decimals: 2 },
    GHS: { symbol: "₵", name: "Cedi ghanés", decimals: 2 },
    GIP: { symbol: "£", name: "Libra de Gibraltar", decimals: 2 },
    GMD: { symbol: "D", name: "Dalasi", decimals: 2 },
    GNF: { symbol: "₣", name: "Franco guineano", decimals: 0 },
    GTQ: { symbol: "Q", name: "Quetzal", decimals: 2 },
    GYD: { symbol: "$", name: "Dólar guyanés", decimals: 2 },
    HKD: { symbol: "HK$", name: "Dólar de Hong Kong", decimals: 2 },
    HNL: { symbol: "L", name: "Lempira", decimals: 2 },
    HTG: { symbol: "G", name: "Gourde", decimals: 2 },
    HUF: { symbol: "Ft", name: "Forinto", decimals: 2 },
    IDR: { symbol: "Rp", name: "Rupia indonesia", decimals: 2 },
    ILS: { symbol: "₪", name: "Nuevo séquel israelí", decimals: 2 },
    INR: { symbol: "₹", name: "Rupia india", decimals: 2 },
    IQD: { symbol: "ع.د", name: "Dinar iraquí", decimals: 3 },
    IRR: { symbol: "﷼", name: "Rial iraní", decimals: 2 },
    ISK: { symbol: "Kr", name: "Corona islandesa", decimals: 0 },
    JMD: { symbol: "$", name: "Dólar jamaiquino", decimals: 2 },
    JOD: { symbol: "د.ا", name: "Dinar jordano", decimals: 3 },
    JPY: { symbol: "¥", name: "Yen japonés", decimals: 0 },
    KES: { symbol: "Sh", name: "Chelín keniano", decimals: 2 },
    KGS: { symbol: "лв", name: "Som", decimals: 2 },
    KHR: { symbol: "៛", name: "Riel", decimals: 2 },
    KMF: { symbol: "FC", name: "Franco comorense", decimals: 0 },
    KPW: { symbol: "₩", name: "Won norcoreano", decimals: 2 },
    KRW: { symbol: "₩", name: "Won surcoreano", decimals: 0 },
    KWD: { symbol: "د.ك", name: "Dinar kuwaití", decimals: 3 },
    KYD: { symbol: "$", name: "Dólar de las Islas Caimán", decimals: 2 },
    KZT: { symbol: "〒", name: "Tenge", decimals: 2 },
    LAK: { symbol: "₭", name: "Kip", decimals: 2 },
    LBP: { symbol: "ل.ل", name: "Libra libanesa", decimals: 2 },
    LKR: { symbol: "Rs", name: "Rupia de Sri Lanka", decimals: 2 },
    LRD: { symbol: "$", name: "Dólar liberiano", decimals: 2 },
    LSL: { symbol: "L", name: "Loti", decimals: 2 },
    LYD: { symbol: "ل.د", name: "Dinar libio", decimals: 3 },
    MAD: { symbol: "د.م.", name: "Dírham marroquí", decimals: 2 },
    MDL: { symbol: "L", name: "Leu moldavo", decimals: 2 },
    MGA: { symbol: "MK", name: "Ariary malgache", decimals: 2 },
    MKD: { symbol: "ден", name: "Denar", decimals: 2 },
    MMK: { symbol: "K", name: "Kyat", decimals: 2 },
    MNT: { symbol: "₮", name: "Tugrik", decimals: 2 },
    MOP: { symbol: "P", name: "Pataca", decimals: 2 },
    MRU: { symbol: "UM", name: "Uguiya", decimals: 2 },
    MUR: { symbol: "₨", name: "Rupia de Mauricio", decimals: 2 },
    MVR: { symbol: "ރ", name: "Rufiyaa", decimals: 2 },
    MWK: { symbol: "MK", name: "Kwacha", decimals: 2 },
    MXN: { symbol: "$", name: "Peso mexicano", decimals: 2 },
    MXV: { symbol: "$", name: "Unidad de Inversión (UDI) mexicana", decimals: 2 },
    MYR: { symbol: "RM", name: "Ringgit malayo", decimals: 2 },
    MZN: { symbol: "MTn", name: "Metical mozambiqueño", decimals: 2 },
    NAD: { symbol: "$", name: "Dólar namibio", decimals: 2 },
    NGN: { symbol: "₦", name: "Naira", decimals: 2 },
    NIO: { symbol: "C$", name: "Córdoba", decimals: 2 },
    NOK: { symbol: "kr", name: "Corona noruega", decimals: 2 },
    NPR: { symbol: "₨", name: "Rupia nepalí", decimals: 2 },
    NZD: { symbol: "$", name: "Dólar neozelandés", decimals: 2 },
    OMR: { symbol: "﷼", name: "Rial omaní", decimals: 3 },
    PAB: { symbol: "B/.", name: "Balboa", decimals: 2 },
    PEN: { symbol: "S/", name: "Sol peruano", decimals: 2 },
    PGK: { symbol: "K", name: "Kina", decimals: 2 },
    PHP: { symbol: "₱", name: "Peso filipino", decimals: 2 },
    PKR: { symbol: "₨", name: "Rupia pakistaní", decimals: 2 },
    PLN: { symbol: "zł", name: "Złoty", decimals: 2 },
    PYG: { symbol: "₲", name: "Guaraní", decimals: 0 },
    QAR: { symbol: "ر.ق", name: "Rial catarí", decimals: 2 },
    RON: { symbol: "L", name: "Leu rumano", decimals: 2 },
    RSD: { symbol: "din", name: "Dinar serbio", decimals: 2 },
    RUB: { symbol: "₽", name: "Rublo ruso", decimals: 2 },
    RWF: { symbol: "₣", name: "Franco ruandés", decimals: 0 },
    SAR: { symbol: "ر.س", name: "Rial saudí", decimals: 2 },
    SBD: { symbol: "$", name: "Dólar de las Islas Salomón", decimals: 2 },
    SCR: { symbol: "Rs", name: "Rupia seychelense", decimals: 2 },
    SDG: { symbol: "£", name: "Libra sudanesa", decimals: 2 },
    SEK: { symbol: "kr", name: "Corona sueca", decimals: 2 },
    SGD: { symbol: "$", name: "Dólar de Singapur", decimals: 2 },
    SHP: { symbol: "£", name: "Libra de Santa Elena", decimals: 2 },
    SLE: { symbol: "Le", name: "Leone", decimals: 2 },
    SOS: { symbol: "Sh", name: "Chelín somalí", decimals: 2 },
    SRD: { symbol: "$", name: "Dólar surinamés", decimals: 2 },
    SSP: { symbol: "SS£", name: "Libra sursudanesa", decimals: 2 },
    STN: { symbol: "Db", name: "Dobra", decimals: 2 },
    SVC: { symbol: "SVC", name: "Colón Salvadoreño", decimals: 2 },
    SYP: { symbol: "£", name: "Libra siria", decimals: 2 },
    SZL: { symbol: "L", name: "Lilangeni", decimals: 2 },
    THB: { symbol: "฿", name: "Baht", decimals: 2 },
    TJS: { symbol: "ЅМ", name: "Somoni tayiko", decimals: 2 },
    TMT: { symbol: "m", name: "Manat turcomano", decimals: 2 },
    TND: { symbol: "د.ت", name: "Dinar tunecino", decimals: 3 },
    TOP: { symbol: "T$", name: "Paʻanga", decimals: 2 },
    TRY: { symbol: "₺", name: "Lira turca", decimals: 2 },
    TTD: { symbol: "$", name: "Dólar de Trinidad y Tobago", decimals: 2 },
    TWD: { symbol: "TWD", name: "Nuevo dólar taiwanés", decimals: 2 },
    TZS: { symbol: "Sh", name: "Chelín tanzano", decimals: 2 },
    UAH: { symbol: "₴", name: "Grivna", decimals: 2 },
    UGX: { symbol: "Sh", name: "Chelín ugandés", decimals: 0 },
    USD: { symbol: "$", name: "Dólar estadounidense", decimals: 2 },
    UYU: { symbol: "$", name: "Peso uruguayo", decimals: 2 },
    UZS: { symbol: "лв", name: "Som uzbeko", decimals: 2 },
    VED: { symbol: "Bs", name: "Bolívar", decimals: 2 },
    VES: { symbol: "Bs.S", name: "Bolívar soberano", decimals: 2 },
    VND: { symbol: "₫", name: "Dong vietnamita", decimals: 0 },
    VUV: { symbol: "Vt", name: "Vatu", decimals: 0 },
    WST: { symbol: "$", name: "Tala", decimals: 2 },
    XAF: { symbol: "₣", name: "Franco CFA de África Central", decimals: 0 },
    XCD: { symbol: "$", name: "Dólar del Caribe Oriental", decimals: 2 },
    XOF: { symbol: "Franc", name: "Franco CFA de África Occidental", decimals: 0 },
    XPF: { symbol: "₣", name: "Franco CFP", decimals: 0 },
    YER: { symbol: "﷼", name: "Rial yemení", decimals: 2 },
    ZAR: { symbol: "R", name: "Rand sudafricano", decimals: 2 },
    ZMW: { symbol: "ZK", name: "Kwacha zambiano", decimals: 2 },
    ZWG: { symbol: "ZiG", name: "Oro de Zimbabue", decimals: 2 },
};

export function formatCurrency(
    amount?: number,
    currency?: string | null,
    options: { asLocaleString: boolean } = { asLocaleString: true },
): string {
    if (amount === undefined) return "";
    if (currency === undefined || currency === null) currency = getDefaultCurrency();

    const currencyData = currencySymbols[currency];
    if (!currencyData) return "";

    const { decimals } = currencyData;
    const rawAmount = amount / Math.pow(10, decimals);
    const hasDecimals = rawAmount % 1 !== 0;
    const formattedAmount = hasDecimals ? rawAmount.toFixed(decimals) : rawAmount.toFixed(0);

    const asLocaleString = options.asLocaleString;

    const locale = (typeof navigator !== "undefined") ? navigator.language : getDefaultLanguage();
    const formatter = new Intl.NumberFormat(locale,
        {
            currency,
            style: 'currency',
            minimumFractionDigits: 0
        }
    );

    return asLocaleString ? formatter.format(rawAmount) : formattedAmount;
}

export function getUnit(currency?: string): number {
    if (!currency) return 0;
    const currencyData = currencySymbols[currency];
    if (!currencyData) return 0;

    const { decimals } = currencyData;

    return Math.pow(10, decimals);
}

export function defaultCurrency(): string {
    const defaultCurrency = getDefaultCurrency();
    return defaultCurrency;
}
