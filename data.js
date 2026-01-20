const HERITAGE_DATA = [
    // --- Gyeongju (Silla Capital) ---
    {
        id: 1,
        name: "불국사",
        region: "gyeongju",
        era: "unified_silla", // 통일신라
        lat: 35.7909,
        lng: 129.3323,
        type: "temple",
        desc: "불교 문화의 정수, 다보탑과 석가탑이 있는 사찰."
    },
    {
        id: 2,
        name: "석굴암",
        region: "gyeongju",
        era: "unified_silla",
        lat: 35.7946,
        lng: 129.3491,
        type: "grotto",
        desc: "화강암을 다듬어 만든 인공 석굴 사원."
    },
    {
        id: 3,
        name: "첨성대",
        region: "gyeongju",
        era: "silla", // 삼국시대(신라)
        lat: 35.8347,
        lng: 129.2190,
        type: "observatory",
        desc: "동양에서 가장 오래된 천문 관측대."
    },
    {
        id: 4,
        name: "동궁과 월지",
        region: "gyeongju",
        era: "unified_silla",
        lat: 35.8342,
        lng: 129.2266,
        type: "palace",
        desc: "신라 왕궁의 별궁 터와 인공 호수."
    },
    {
        id: 5,
        name: "대릉원",
        region: "gyeongju",
        era: "silla",
        lat: 35.8373,
        lng: 129.2120,
        type: "tomb",
        desc: "신라 시대의 거대한 고분들이 모여 있는 곳."
    },
    {
        id: 6,
        name: "분황사",
        region: "gyeongju",
        era: "silla",
        lat: 35.8404,
        lng: 129.2230,
        type: "temple",
        desc: "선덕여왕 때 창건된 사찰, 모전석탑이 유명."
    },

    // --- Seoul (Joseon Capital) ---
    {
        id: 10,
        name: "경복궁",
        region: "seoul",
        era: "joseon", // 조선
        lat: 37.5796,
        lng: 126.9770,
        type: "palace",
        desc: "조선 왕조의 법궁, 근정전과 경회루."
    },
    {
        id: 11,
        name: "창덕궁",
        region: "seoul",
        era: "joseon",
        lat: 37.5826,
        lng: 126.9919,
        type: "palace",
        desc: "아름다운 후원이 있는 유네스코 세계유산."
    },
    {
        id: 12,
        name: "종묘",
        region: "seoul",
        era: "joseon",
        lat: 37.5744,
        lng: 126.9940,
        type: "shrine",
        desc: "조선 왕과 왕비의 신주를 모신 사당."
    },
    {
        id: 13,
        name: "북촌한옥마을",
        region: "seoul",
        era: "joseon",
        lat: 37.5829,
        lng: 126.9835,
        type: "village",
        desc: "전통 한옥이 밀집되어 있는 주거 지역."
    },

    // --- Buyeo (Baekje Capital) ---
    {
        id: 20,
        name: "부소산성",
        region: "buyeo",
        era: "silla", // 삼국시대(백제) - Era coding simplified for demo (silla=3 kingdoms usually for this logic)
        // Correction: Let's map strict eras in app logic.
        // era codes: "silla" (3 kingdoms), "unified_silla", "goryeo", "joseon"
        lat: 36.2917,
        lng: 126.9129,
        type: "fortress",
        desc: "백제 최후의 방어성, 낙화암이 있는 곳."
    },
    {
        id: 21,
        name: "정림사지",
        region: "buyeo",
        era: "silla", // Baekje time
        lat: 36.2794,
        lng: 126.9123,
        type: "temple_site",
        desc: "백제 시대의 절터, 5층 석탑이 남아있음."
    },
    {
        id: 22,
        name: "궁남지",
        region: "buyeo",
        era: "silla",
        lat: 36.2745,
        lng: 126.9152,
        type: "pond",
        desc: "백제 무왕 때 만든 한국 최초의 인공 연못."
    }
];

const ERA_MAP = {
    0: "silla", // 삼국
    1: "unified_silla", // 통일신라
    2: "goryeo", // 고려
    3: "joseon", // 조선
    4: "all" // 전체
};

// Helper for UI Text
const ERA_LABELS = {
    "silla": "삼국시대",
    "unified_silla": "통일신라",
    "goryeo": "고려시대",
    "joseon": "조선시대",
    "all": "전체 시대"
};
