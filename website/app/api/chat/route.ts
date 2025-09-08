import { type NextRequest, NextResponse } from "next/server"

const astroResponses = [
  "🌟 आपके सितारे कह रहे हैं कि आने वाला समय आपके लिए बहुत शुभ है। शनि की दशा में कुछ बदलाव आने वाले हैं।",
  "🔮 आपकी राशि के अनुसार, आज का दिन नए अवसरों से भरा है। गुरु ग्रह आपके साथ है।",
  "✨ मंगल की स्थिति देखकर लगता है कि आपके करियर में जल्द ही तरक्की होगी। धैर्य रखें।",
  "🌙 चंद्रमा की कृपा से आपके रिश्तों में मधुरता आएगी। परिवार के साथ समय बिताएं।",
  "⭐ राहु-केतु की दशा में सावधानी बरतें। किसी भी बड़े फैसले से पहले सोच-विचार करें।",
  "🪐 शुक्र ग्रह आपके प्रेम जीवन में खुशियां लाने वाला है। सकारात्मक रहें।",
  "🌟 आपकी कुंडली में सूर्य की मजबूत स्थिति है। आत्मविश्वास बनाए रखें।",
  "🔮 बुध ग्रह की कृपा से आपकी बुद्धि तेज होगी। नए काम शुरू करने का अच्छा समय है।",
]

const astroNames = ["गुरुजी राम शर्मा", "पंडित विष्णु गुप्ता", "आचार्य सुरेश जी", "गुरुजी अनिल शास्त्री", "पंडित राजेश तिवारी"]

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const randomResponse = astroResponses[Math.floor(Math.random() * astroResponses.length)]
    const randomName = astroNames[Math.floor(Math.random() * astroNames.length)]

    return NextResponse.json({
      response: randomResponse,
      astrologer: randomName,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get astro response" }, { status: 500 })
  }
}
