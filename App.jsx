import { useState, useEffect, useRef, useMemo } from "react";

// ============================================================
// 犬種データ（50犬種の特徴をスコア化）
// 各スコアは 1-5 のスケール
// dimensions: energy, independence, sociability, patience, 
//             structure_need, grooming_tolerance, space_need,
//             experience_level, child_friendly, pet_friendly,
//             noise_tolerance, exercise_commitment, budget
// ============================================================
const BREED_DATA = [
  { name: "プードル", size: "小型", img: "🐩", scores: { energy: 4, independence: 2, sociability: 5, patience: 3, structure_need: 2, grooming_tolerance: 5, space_need: 2, experience_level: 1, child_friendly: 5, pet_friendly: 5, noise_tolerance: 3, exercise_commitment: 3, budget: 4 }, tags: ["賢い","人懐っこい","甘えん坊","抜け毛少"], health: ["膝蓋骨脱臼","皮膚疾患","目の病気"], summary: "知性と愛嬌を兼ね備えた万能犬。トリミング代は覚悟が必要だが、抜け毛の少なさは魅力。" },
  { name: "チワワ", size: "超小型", img: "🐕", scores: { energy: 3, independence: 3, sociability: 3, patience: 2, structure_need: 3, grooming_tolerance: 2, space_need: 1, experience_level: 3, child_friendly: 2, pet_friendly: 3, noise_tolerance: 4, exercise_commitment: 1, budget: 2 }, tags: ["献身的","勇敢","警戒心強い","ツンデレ"], health: ["膝蓋骨脱臼","心臓病","気管虚脱"], summary: "小さな体に大きな個性。飼い主一筋のツンデレ気質が魅力だが、社会化が鍵。" },
  { name: "ダックスフンド", size: "小型", img: "🌭", scores: { energy: 4, independence: 3, sociability: 4, patience: 3, structure_need: 3, grooming_tolerance: 3, space_need: 2, experience_level: 3, child_friendly: 4, pet_friendly: 4, noise_tolerance: 3, exercise_commitment: 3, budget: 3 }, tags: ["好奇心旺盛","忠実","空気を読む","甘えん坊"], health: ["椎間板ヘルニア","外耳炎","進行性網膜萎縮症"], summary: "胴長短足の愛されボディ。飼い主の気持ちを読む天才だが、腰のケアは必須。" },
  { name: "ポメラニアン", size: "超小型", img: "🦊", scores: { energy: 4, independence: 3, sociability: 4, patience: 2, structure_need: 3, grooming_tolerance: 4, space_need: 1, experience_level: 2, child_friendly: 3, pet_friendly: 3, noise_tolerance: 4, exercise_commitment: 2, budget: 3 }, tags: ["勇敢","自立心","活発","甘えん坊"], health: ["骨折","膝蓋骨脱臼","気管虚脱"], summary: "小さなライオンの異名通り、勇敢で自己主張が強い。ふわふわの毛並みに癒される。" },
  { name: "ミニチュア・シュナウザー", size: "小型", img: "🧔", scores: { energy: 4, independence: 3, sociability: 4, patience: 3, structure_need: 3, grooming_tolerance: 4, space_need: 2, experience_level: 2, child_friendly: 4, pet_friendly: 3, noise_tolerance: 3, exercise_commitment: 3, budget: 3 }, tags: ["聡明","忠実","番犬気質","タフ"], health: ["尿路結石","膵炎","皮膚疾患"], summary: "おひげがチャームポイントの知的番犬。家族への忠誠心が厚く、番犬としても優秀。" },
  { name: "マルチーズ", size: "超小型", img: "🤍", scores: { energy: 3, independence: 2, sociability: 5, patience: 3, structure_need: 2, grooming_tolerance: 5, space_need: 1, experience_level: 1, child_friendly: 4, pet_friendly: 4, noise_tolerance: 3, exercise_commitment: 1, budget: 3 }, tags: ["穏やか","愛情深い","抱っこ好き","従順"], health: ["膝蓋骨脱臼","流涙症","心臓病"], summary: "白い絹のような被毛の天使。穏やかな性格で初心者にも安心だが、毛のケアは手厚く。" },
  { name: "フレンチ・ブルドッグ", size: "小型", img: "🐷", scores: { energy: 3, independence: 2, sociability: 5, patience: 4, structure_need: 2, grooming_tolerance: 1, space_need: 2, experience_level: 2, child_friendly: 5, pet_friendly: 4, noise_tolerance: 2, exercise_commitment: 2, budget: 4 }, tags: ["愛嬌抜群","のんびり","甘えん坊","ユーモラス"], health: ["短頭種気道症候群","皮膚疾患","椎間板疾患"], summary: "ブサカワ界のキング。愛嬌と甘え上手で家族を笑顔にするが、暑さに弱いので温度管理を。" },
  { name: "ヨークシャー・テリア", size: "超小型", img: "💎", scores: { energy: 4, independence: 3, sociability: 4, patience: 2, structure_need: 3, grooming_tolerance: 5, space_need: 1, experience_level: 3, child_friendly: 3, pet_friendly: 3, noise_tolerance: 4, exercise_commitment: 2, budget: 3 }, tags: ["気高い","勇敢","活発","美しい被毛"], health: ["膝蓋骨脱臼","気管虚脱","門脈シャント"], summary: "動く宝石と称される美しさ。テリアらしい気の強さもあるが、その分個性が光る。" },
  { name: "ビション・フリーゼ", size: "小型", img: "☁️", scores: { energy: 4, independence: 2, sociability: 5, patience: 4, structure_need: 2, grooming_tolerance: 5, space_need: 2, experience_level: 1, child_friendly: 5, pet_friendly: 5, noise_tolerance: 2, exercise_commitment: 3, budget: 4 }, tags: ["陽気","社交的","アレルギーに優しい","愛されキャラ"], health: ["膝蓋骨脱臼","白内障","アレルギー"], summary: "歩く綿菓子のような愛らしさ。誰にでもフレンドリーで家庭犬の理想形。" },
  { name: "シーズー", size: "小型", img: "🦁", scores: { energy: 2, independence: 3, sociability: 4, patience: 4, structure_need: 2, grooming_tolerance: 5, space_need: 1, experience_level: 1, child_friendly: 4, pet_friendly: 4, noise_tolerance: 2, exercise_commitment: 1, budget: 3 }, tags: ["マイペース","穏やか","愛情深い","おっとり"], health: ["眼疾患","皮膚疾患","椎間板疾患"], summary: "皇帝に愛された犬。マイペースでおっとりした性格が現代の癒し犬として最適。" },
  { name: "ゴールデン・レトリーバー", size: "大型", img: "🌟", scores: { energy: 5, independence: 2, sociability: 5, patience: 5, structure_need: 2, grooming_tolerance: 4, space_need: 5, experience_level: 2, child_friendly: 5, pet_friendly: 5, noise_tolerance: 2, exercise_commitment: 5, budget: 5 }, tags: ["温厚","忠実","賢い","子供の親友"], health: ["股関節形成不全","悪性腫瘍","皮膚疾患"], summary: "犬界のゴールデンスタンダード。優しさと賢さの塊だが、運動量とスペースはしっかり確保を。" },
  { name: "パグ", size: "小型", img: "😊", scores: { energy: 2, independence: 2, sociability: 5, patience: 4, structure_need: 1, grooming_tolerance: 2, space_need: 1, experience_level: 1, child_friendly: 5, pet_friendly: 4, noise_tolerance: 2, exercise_commitment: 1, budget: 3 }, tags: ["愛嬌","のんびり","食いしん坊","人間好き"], health: ["短頭種気道症候群","眼疾患","皮膚疾患"], summary: "表情豊かな癒し系。運動量は少なめでOKだが、体重管理と暑さ対策は必須。" },
  { name: "ウェルシュ・コーギー", size: "中型", img: "🍑", scores: { energy: 5, independence: 3, sociability: 4, patience: 3, structure_need: 3, grooming_tolerance: 3, space_need: 3, experience_level: 3, child_friendly: 4, pet_friendly: 3, noise_tolerance: 3, exercise_commitment: 4, budget: 3 }, tags: ["活発","賢い","牧羊犬気質","お尻がキュート"], health: ["椎間板疾患","股関節形成不全","変性性脊髄症"], summary: "プリプリお尻の働き者。頭の良さと体力は抜群だが、太りやすいので食事管理を。" },
  { name: "ボーダー・コリー", size: "中型", img: "🧠", scores: { energy: 5, independence: 3, sociability: 4, patience: 3, structure_need: 5, grooming_tolerance: 3, space_need: 5, experience_level: 5, child_friendly: 4, pet_friendly: 4, noise_tolerance: 3, exercise_commitment: 5, budget: 3 }, tags: ["天才犬","エネルギッシュ","作業意欲","アスリート"], health: ["コリー眼異常","股関節形成不全","てんかん"], summary: "犬界のアインシュタイン。頭脳と体力のモンスターで、飼い主にも相応の覚悟が必要。" },
  { name: "ペキニーズ", size: "超小型", img: "👑", scores: { energy: 2, independence: 5, sociability: 3, patience: 3, structure_need: 1, grooming_tolerance: 4, space_need: 1, experience_level: 3, child_friendly: 2, pet_friendly: 3, noise_tolerance: 2, exercise_commitment: 1, budget: 3 }, tags: ["猫のような犬","自立心","マイペース","気品"], health: ["短頭種気道症候群","眼疾患","椎間板疾患"], summary: "犬なのに猫のような独立心。自分のペースを崩さない気品ある犬種。" },
  { name: "柴犬", size: "中型", img: "🏯", scores: { energy: 4, independence: 5, sociability: 3, patience: 3, structure_need: 4, grooming_tolerance: 3, space_need: 3, experience_level: 4, child_friendly: 3, pet_friendly: 2, noise_tolerance: 3, exercise_commitment: 4, budget: 3 }, tags: ["忠実","独立心","日本犬らしさ","柴ドリル"], health: ["アレルギー性皮膚炎","膝蓋骨脱臼","認知症"], summary: "日本が誇る忠犬。ツンデレ極まりない性格は上級者向けだが、信頼関係ができれば最高の相棒。" },
  { name: "キャバリア", size: "小型", img: "🎀", scores: { energy: 3, independence: 1, sociability: 5, patience: 5, structure_need: 1, grooming_tolerance: 3, space_need: 2, experience_level: 1, child_friendly: 5, pet_friendly: 5, noise_tolerance: 1, exercise_commitment: 2, budget: 3 }, tags: ["究極の甘えん坊","穏やか","誰とでも仲良し","膝犬"], health: ["僧帽弁閉鎖不全症","脊髄空洞症","眼疾患"], summary: "膝の上が定位置の究極の愛玩犬。穏やかさNo.1だが、心臓の定期検診は欠かさずに。" },
  { name: "パピヨン", size: "超小型", img: "🦋", scores: { energy: 4, independence: 2, sociability: 4, patience: 3, structure_need: 2, grooming_tolerance: 3, space_need: 1, experience_level: 2, child_friendly: 4, pet_friendly: 4, noise_tolerance: 3, exercise_commitment: 2, budget: 2 }, tags: ["蝶の耳","聡明","活発","優雅"], health: ["膝蓋骨脱臼","進行性網膜萎縮症","歯科疾患"], summary: "蝶のような耳が優雅な知性派。小型犬の中ではトップクラスの賢さを持つ。" },
  { name: "ラブラドール・レトリーバー", size: "大型", img: "🎾", scores: { energy: 5, independence: 2, sociability: 5, patience: 5, structure_need: 3, grooming_tolerance: 2, space_need: 5, experience_level: 2, child_friendly: 5, pet_friendly: 5, noise_tolerance: 2, exercise_commitment: 5, budget: 5 }, tags: ["万能","食いしん坊","水が大好き","忠実"], health: ["股関節形成不全","肥満","悪性腫瘍"], summary: "世界で最も愛される犬種の一つ。食いしん坊なので体重管理は飼い主の腕の見せ所。" },
  { name: "イタリアン・グレーハウンド", size: "小型", img: "💨", scores: { energy: 4, independence: 3, sociability: 4, patience: 2, structure_need: 2, grooming_tolerance: 1, space_need: 2, experience_level: 3, child_friendly: 3, pet_friendly: 4, noise_tolerance: 2, exercise_commitment: 3, budget: 3 }, tags: ["繊細","スプリンター","甘えん坊","美しいライン"], health: ["骨折","膝蓋骨脱臼","歯科疾患","Color Dilution Alopecia"], summary: "走る芸術品。繊細で寒がりだが、心を許した相手にはべったり甘える愛情深い犬種。" },
  { name: "ジャック・ラッセル・テリア", size: "小型", img: "⚡", scores: { energy: 5, independence: 4, sociability: 4, patience: 2, structure_need: 4, grooming_tolerance: 2, space_need: 3, experience_level: 5, child_friendly: 3, pet_friendly: 2, noise_tolerance: 4, exercise_commitment: 5, budget: 3 }, tags: ["超活発","冒険家","頑固","パワフル"], health: ["膝蓋骨脱臼","レッグ・ペルテス病","眼疾患"], summary: "小型犬界のアスリート。尽きないエネルギーの持ち主で、アクティブな飼い主向け。" },
  { name: "ミニチュア・ピンシャー", size: "超小型", img: "🔥", scores: { energy: 5, independence: 4, sociability: 3, patience: 2, structure_need: 3, grooming_tolerance: 1, space_need: 2, experience_level: 4, child_friendly: 2, pet_friendly: 2, noise_tolerance: 4, exercise_commitment: 3, budget: 2 }, tags: ["キングオブトイ","勇敢","自立心","スタイリッシュ"], health: ["膝蓋骨脱臼","レッグ・ペルテス病","進行性網膜萎縮症"], summary: "小さなドーベルマンの異名。自信に満ちた態度は小型犬とは思えない堂々たるもの。" },
  { name: "シベリアン・ハスキー", size: "大型", img: "🐺", scores: { energy: 5, independence: 5, sociability: 4, patience: 3, structure_need: 4, grooming_tolerance: 4, space_need: 5, experience_level: 5, child_friendly: 4, pet_friendly: 3, noise_tolerance: 5, exercise_commitment: 5, budget: 5 }, tags: ["狼のような美貌","独立心","遠吠え","冒険家"], health: ["股関節形成不全","眼疾患","皮膚疾患"], summary: "狼を彷彿とさせる野性美。独立心が強く脱走の名人なので、確実な管理環境が必要。" },
  { name: "シェットランド・シープドッグ", size: "中型", img: "🐑", scores: { energy: 4, independence: 2, sociability: 4, patience: 3, structure_need: 3, grooming_tolerance: 4, space_need: 3, experience_level: 2, child_friendly: 4, pet_friendly: 4, noise_tolerance: 4, exercise_commitment: 3, budget: 3 }, tags: ["優美","忠実","賢い","繊細"], health: ["コリー眼異常","甲状腺機能低下症","皮膚疾患"], summary: "小さなコリーのような優美さと忠誠心。繊細な心の持ち主で、優しい飼い主に応える。" },
  { name: "ボストン・テリア", size: "小型", img: "🎩", scores: { energy: 3, independence: 2, sociability: 5, patience: 4, structure_need: 2, grooming_tolerance: 1, space_need: 2, experience_level: 1, child_friendly: 5, pet_friendly: 4, noise_tolerance: 2, exercise_commitment: 2, budget: 3 }, tags: ["紳士","愛嬌","タキシード模様","フレンドリー"], health: ["短頭種気道症候群","眼疾患","膝蓋骨脱臼"], summary: "アメリカン・ジェントルマンの愛称通り、礼儀正しく社交的。初心者にも飼いやすい。" },
  { name: "アメリカン・コッカー・スパニエル", size: "中型", img: "🌈", scores: { energy: 4, independence: 2, sociability: 5, patience: 4, structure_need: 2, grooming_tolerance: 5, space_need: 3, experience_level: 2, child_friendly: 5, pet_friendly: 4, noise_tolerance: 2, exercise_commitment: 3, budget: 4 }, tags: ["陽気","美しい被毛","人懐っこい","ハッピー"], health: ["外耳炎","白内障","皮膚疾患"], summary: "ディズニーの『わんわん物語』のモデル犬。陽気で美しく、家庭犬の理想像。" },
  { name: "ビーグル", size: "中型", img: "🔍", scores: { energy: 5, independence: 4, sociability: 5, patience: 3, structure_need: 3, grooming_tolerance: 2, space_need: 3, experience_level: 3, child_friendly: 5, pet_friendly: 5, noise_tolerance: 5, exercise_commitment: 4, budget: 3 }, tags: ["嗅覚の天才","群れ好き","食いしん坊","バセットハウンド"], health: ["椎間板疾患","てんかん","甲状腺機能低下症"], summary: "スヌーピーのモデル犬。鼻がすごすぎて散歩は嗅覚の旅になるが、その分個性的。" },
  { name: "日本スピッツ", size: "中型", img: "⛄", scores: { energy: 4, independence: 3, sociability: 4, patience: 3, structure_need: 2, grooming_tolerance: 4, space_need: 2, experience_level: 2, child_friendly: 4, pet_friendly: 4, noise_tolerance: 3, exercise_commitment: 3, budget: 3 }, tags: ["白い妖精","明るい","番犬気質","ふわふわ"], health: ["膝蓋骨脱臼","流涙症","皮膚疾患"], summary: "真っ白なふわふわの被毛が魅力的な日本生まれの犬種。番犬としても家庭犬としても優秀。" },
  { name: "バーニーズ・マウンテン・ドッグ", size: "超大型", img: "🏔️", scores: { energy: 4, independence: 2, sociability: 5, patience: 5, structure_need: 2, grooming_tolerance: 4, space_need: 5, experience_level: 3, child_friendly: 5, pet_friendly: 5, noise_tolerance: 2, exercise_commitment: 4, budget: 5 }, tags: ["穏やかな巨人","忠実","家族大好き","短命"], health: ["悪性腫瘍","股関節形成不全","胃捻転"], summary: "大きな体に優しい心。家族を包み込む愛情は深いが、大型犬ゆえの医療費と短命は覚悟を。" },
  { name: "ブルドッグ", size: "中型", img: "💪", scores: { energy: 2, independence: 3, sociability: 4, patience: 5, structure_need: 1, grooming_tolerance: 2, space_need: 2, experience_level: 2, child_friendly: 5, pet_friendly: 4, noise_tolerance: 2, exercise_commitment: 1, budget: 5 }, tags: ["動じない","忍耐強い","ユーモラス","いびき"], health: ["短頭種気道症候群","皮膚疾患","股関節形成不全"], summary: "どっしり構えた不動の精神。運動嫌いだが医療費は覚悟。いびきも味わいの一つ。" },
  { name: "サモエド", size: "大型", img: "😁", scores: { energy: 4, independence: 3, sociability: 5, patience: 4, structure_need: 3, grooming_tolerance: 5, space_need: 4, experience_level: 3, child_friendly: 5, pet_friendly: 4, noise_tolerance: 3, exercise_commitment: 4, budget: 5 }, tags: ["サモエドスマイル","ふわふわ","社交的","寒さに強い"], health: ["股関節形成不全","進行性網膜萎縮症","糖尿病"], summary: "笑顔が世界一の犬種。真っ白なふわふわボディは天使そのもの。暑さには弱い。" },
  { name: "ドーベルマン", size: "大型", img: "🖤", scores: { energy: 5, independence: 3, sociability: 3, patience: 3, structure_need: 5, grooming_tolerance: 1, space_need: 5, experience_level: 5, child_friendly: 3, pet_friendly: 2, noise_tolerance: 3, exercise_commitment: 5, budget: 5 }, tags: ["知性と忠誠","護衛犬","スタイリッシュ","一途"], health: ["拡張型心筋症","フォン・ヴィルブランド病","股関節形成不全"], summary: "忠誠心と知性のエリート犬。見た目の迫力とは裏腹に飼い主にはデレデレ。上級者向け。" },
  { name: "ウエスティ", size: "小型", img: "🏴", scores: { energy: 4, independence: 4, sociability: 4, patience: 3, structure_need: 3, grooming_tolerance: 4, space_need: 2, experience_level: 3, child_friendly: 4, pet_friendly: 3, noise_tolerance: 3, exercise_commitment: 3, budget: 3 }, tags: ["自信家","テリア気質","白い被毛","タフ"], health: ["皮膚疾患","膝蓋骨脱臼","肝臓疾患"], summary: "白い小さなテリアの代表格。自信たっぷりの性格はテリアらしさ全開。" },
  { name: "グレート・ピレニーズ", size: "超大型", img: "🐻‍❄️", scores: { energy: 3, independence: 5, sociability: 3, patience: 4, structure_need: 4, grooming_tolerance: 4, space_need: 5, experience_level: 5, child_friendly: 4, pet_friendly: 3, noise_tolerance: 4, exercise_commitment: 3, budget: 5 }, tags: ["護衛犬","独立心","堂々","白い巨体"], health: ["股関節形成不全","胃捻転","骨肉腫"], summary: "白い山の守護者。独立心が強く自分で判断する犬なので、上級者向けの大型犬。" },
  { name: "狆", size: "超小型", img: "🎎", scores: { energy: 2, independence: 3, sociability: 4, patience: 4, structure_need: 1, grooming_tolerance: 3, space_need: 1, experience_level: 1, child_friendly: 4, pet_friendly: 4, noise_tolerance: 1, exercise_commitment: 1, budget: 2 }, tags: ["日本の宮廷犬","穏やか","気品","猫のよう"], health: ["膝蓋骨脱臼","心臓病","眼疾患"], summary: "日本の宮廷で愛された気品ある犬種。穏やかで静かなため、マンション住まいにも最適。" },
  { name: "ジャーマン・シェパード", size: "大型", img: "🛡️", scores: { energy: 5, independence: 3, sociability: 3, patience: 3, structure_need: 5, grooming_tolerance: 3, space_need: 5, experience_level: 5, child_friendly: 4, pet_friendly: 3, noise_tolerance: 3, exercise_commitment: 5, budget: 5 }, tags: ["万能作業犬","忠誠心","知性","威厳"], health: ["股関節形成不全","変性性脊髄症","膵臓外分泌不全"], summary: "警察犬・救助犬として世界で活躍する万能犬。高い知性と忠誠心の持ち主。上級者向け。" },
  { name: "イングリッシュ・コッカー・スパニエル", size: "中型", img: "🎵", scores: { energy: 4, independence: 2, sociability: 5, patience: 4, structure_need: 2, grooming_tolerance: 4, space_need: 3, experience_level: 2, child_friendly: 5, pet_friendly: 4, noise_tolerance: 2, exercise_commitment: 4, budget: 3 }, tags: ["陽気","活発","しっぽ振り","美しい被毛"], health: ["外耳炎","進行性網膜萎縮症","股関節形成不全"], summary: "尻尾の振り方で世界一幸せな犬。陽気で活発、フィールドワークが大好き。" },
  { name: "ウィペット", size: "中型", img: "🏃", scores: { energy: 4, independence: 3, sociability: 3, patience: 3, structure_need: 2, grooming_tolerance: 1, space_need: 3, experience_level: 2, child_friendly: 4, pet_friendly: 4, noise_tolerance: 1, exercise_commitment: 3, budget: 2 }, tags: ["静かなスプリンター","繊細","穏やか","スリム"], health: ["心臓病","眼疾患","皮膚が薄い"], summary: "走る時は全力、家では置物。オン・オフの切り替えが見事な省エネ犬。" },
  { name: "ボルゾイ", size: "超大型", img: "🎭", scores: { energy: 4, independence: 5, sociability: 3, patience: 3, structure_need: 2, grooming_tolerance: 3, space_need: 5, experience_level: 4, child_friendly: 3, pet_friendly: 2, noise_tolerance: 1, exercise_commitment: 4, budget: 5 }, tags: ["貴族的","優雅","独立心","猟犬"], health: ["胃捻転","心臓病","骨肉腫"], summary: "ロシア貴族に愛された走る芸術品。優雅で独立心が強く、猫のような犬。" },
  { name: "秋田犬", size: "大型", img: "🗾", scores: { energy: 4, independence: 5, sociability: 2, patience: 3, structure_need: 5, grooming_tolerance: 3, space_need: 5, experience_level: 5, child_friendly: 3, pet_friendly: 1, noise_tolerance: 3, exercise_commitment: 4, budget: 5 }, tags: ["忠犬","威厳","日本の誇り","一途"], health: ["股関節形成不全","自己免疫疾患","甲状腺機能低下症"], summary: "ハチ公で世界的に有名な忠犬。飼い主への一途な忠誠は感動的だが、上級者向け。" },
  { name: "オールド・イングリッシュ・シープドッグ", size: "大型", img: "🧸", scores: { energy: 4, independence: 2, sociability: 5, patience: 4, structure_need: 2, grooming_tolerance: 5, space_need: 4, experience_level: 3, child_friendly: 5, pet_friendly: 4, noise_tolerance: 3, exercise_commitment: 4, budget: 5 }, tags: ["もふもふ","陽気","子守犬","甘えん坊"], health: ["股関節形成不全","眼疾患","甲状腺機能低下症"], summary: "全身もふもふの癒し系巨体犬。子守犬としての評価が高く、被毛の手入れは本格的。" },
  { name: "フラットコーテッド・レトリーバー", size: "大型", img: "🌻", scores: { energy: 5, independence: 2, sociability: 5, patience: 4, structure_need: 2, grooming_tolerance: 3, space_need: 5, experience_level: 3, child_friendly: 5, pet_friendly: 5, noise_tolerance: 2, exercise_commitment: 5, budget: 5 }, tags: ["永遠のパピー","陽気","活発","アウトドア派"], health: ["悪性腫瘍","股関節形成不全","膝蓋骨脱臼"], summary: "永遠に子犬のような陽気さを持つレトリーバー。アウトドア派の最高のパートナー。" },
  { name: "ワイマラナー", size: "大型", img: "👻", scores: { energy: 5, independence: 3, sociability: 4, patience: 2, structure_need: 4, grooming_tolerance: 1, space_need: 5, experience_level: 5, child_friendly: 3, pet_friendly: 3, noise_tolerance: 3, exercise_commitment: 5, budget: 5 }, tags: ["グレーゴースト","スタミナ","知性","分離不安"], health: ["胃捻転","股関節形成不全","皮膚疾患"], summary: "銀灰色の幽霊犬。分離不安になりやすいほど飼い主LOVE。運動量はアスリート級。" },
  { name: "ロットワイラー", size: "超大型", img: "⚔️", scores: { energy: 4, independence: 3, sociability: 3, patience: 4, structure_need: 5, grooming_tolerance: 1, space_need: 5, experience_level: 5, child_friendly: 3, pet_friendly: 2, noise_tolerance: 2, exercise_commitment: 4, budget: 5 }, tags: ["力強い","忠実","護衛犬","穏やかな巨人"], health: ["股関節形成不全","骨肉腫","拡張型心筋症"], summary: "見た目は迫力満点だが家族にはメロメロ。しっかりとした訓練と社会化が必須の上級犬種。" },
  { name: "ニューファンドランド", size: "超大型", img: "🌊", scores: { energy: 3, independence: 2, sociability: 5, patience: 5, structure_need: 2, grooming_tolerance: 5, space_need: 5, experience_level: 3, child_friendly: 5, pet_friendly: 5, noise_tolerance: 2, exercise_commitment: 3, budget: 5 }, tags: ["水難救助犬","穏やかな巨人","よだれ","家族愛"], health: ["股関節形成不全","心臓病","胃捻転"], summary: "泳ぐ熊のような巨体に超穏やかな心。子供の守護者として世界的に定評あり。" },
  { name: "アラスカン・マラミュート", size: "大型", img: "🐻", scores: { energy: 5, independence: 5, sociability: 4, patience: 3, structure_need: 5, grooming_tolerance: 4, space_need: 5, experience_level: 5, child_friendly: 3, pet_friendly: 2, noise_tolerance: 5, exercise_commitment: 5, budget: 5 }, tags: ["力強い","独立心","遠吠え","そり犬"], health: ["股関節形成不全","白内障","甲状腺機能低下症"], summary: "アラスカの極寒を生き抜くパワフル犬。見た目のハスキーとの差は体格と性格の頑固さ。" },
  { name: "ダルメシアン", size: "大型", img: "⚫⚪", scores: { energy: 5, independence: 3, sociability: 4, patience: 3, structure_need: 4, grooming_tolerance: 2, space_need: 5, experience_level: 4, child_friendly: 4, pet_friendly: 3, noise_tolerance: 3, exercise_commitment: 5, budget: 4 }, tags: ["水玉模様","スタミナ","馬車犬","ユニーク"], health: ["難聴","尿路結石","皮膚疾患"], summary: "101匹で有名な水玉犬。無限のスタミナを持ち、長距離ランナーの相棒に最適。" },
  { name: "ミニチュア・ブル・テリア", size: "小型", img: "🥚", scores: { energy: 4, independence: 4, sociability: 4, patience: 3, structure_need: 3, grooming_tolerance: 1, space_need: 2, experience_level: 4, child_friendly: 3, pet_friendly: 2, noise_tolerance: 3, exercise_commitment: 3, budget: 3 }, tags: ["ユニークな顔","頑固","遊び好き","愛嬌"], health: ["心臓病","腎臓病","膝蓋骨脱臼"], summary: "卵型の顔がトレードマーク。頑固だがユーモラスで、唯一無二の存在感。" },
  { name: "オーストラリアン・シェパード", size: "中型", img: "🌀", scores: { energy: 5, independence: 3, sociability: 4, patience: 3, structure_need: 4, grooming_tolerance: 3, space_need: 4, experience_level: 4, child_friendly: 4, pet_friendly: 4, noise_tolerance: 3, exercise_commitment: 5, budget: 4 }, tags: ["多芸","アスリート","美しい毛色","牧羊犬"], health: ["股関節形成不全","てんかん","眼疾患"], summary: "マーブル模様が美しい万能牧羊犬。知性と運動能力のハイブリッド。" },
  { name: "ノーフォーク・テリア", size: "超小型", img: "🌾", scores: { energy: 4, independence: 3, sociability: 4, patience: 3, structure_need: 2, grooming_tolerance: 3, space_need: 1, experience_level: 2, child_friendly: 4, pet_friendly: 3, noise_tolerance: 3, exercise_commitment: 3, budget: 2 }, tags: ["小さな冒険家","テリア気質","友好的","タフ"], health: ["僧帽弁閉鎖不全症","膝蓋骨脱臼","皮膚疾患"], summary: "テリアの中でも穏やかで友好的。小さな体に大きな冒険心を秘めた愛すべき犬種。" },
];

// ============================================================
// 質問セット（心理学的5次元モデル）
// Big5パーソナリティ + ライフスタイル + 価値観を組み合わせた独自モデル
// 
// 8つのマッチング軸:
// 1. activity_level - 活動性（アウトドア派↔インドア派）
// 2. social_style - 社交性（パーティ好き↔少人数好き）
// 3. control_desire - 統制欲求（計画的↔自由奔放）
// 4. emotional_style - 感情スタイル（情熱的↔クール）
// 5. care_commitment - ケア意欲（お世話好き↔ミニマル）
// 6. space_budget - 環境（広い↔コンパクト）
// 7. experience - 経験値（上級↔初心者）
// 8. family_structure - 家族構成（子供あり、多頭飼い等）
// ============================================================
const QUESTIONS = [
  // Block 1: あなた自身のリズム（活動性・エネルギー）
  {
    id: 1,
    block: "あなた自身のリズム",
    blockIcon: "🕐",
    question: "理想の休日の過ごし方は？",
    options: [
      { text: "山や海でアクティビティ三昧", axis: "activity_level", value: 5, sub: [{axis:"exercise_commitment",value:5}] },
      { text: "街歩きやカフェ巡り", axis: "activity_level", value: 3.5, sub: [{axis:"exercise_commitment",value:3}] },
      { text: "家でNetflixとゴロゴロ", axis: "activity_level", value: 1.5, sub: [{axis:"exercise_commitment",value:1}] },
      { text: "日によってバラバラ", axis: "activity_level", value: 3, sub: [{axis:"exercise_commitment",value:3}] },
    ],
  },
  {
    id: 2,
    block: "あなた自身のリズム",
    blockIcon: "🕐",
    question: "朝型？夜型？",
    options: [
      { text: "早朝に活動開始、朝散歩も余裕", axis: "activity_level", value: 5, sub: [{axis:"exercise_commitment",value:5}] },
      { text: "普通に起きるけど朝は苦手", axis: "activity_level", value: 3, sub: [{axis:"exercise_commitment",value:3}] },
      { text: "完全夜型、朝は無理", axis: "activity_level", value: 2, sub: [{axis:"exercise_commitment",value:1}] },
      { text: "不規則で一定しない", axis: "activity_level", value: 2.5, sub: [{axis:"control_desire",value:2}] },
    ],
  },
  {
    id: 3,
    block: "あなた自身のリズム",
    blockIcon: "🕐",
    question: "体力に自信は？",
    options: [
      { text: "フルマラソン完走できる", axis: "activity_level", value: 5, sub: [{axis:"exercise_commitment",value:5}] },
      { text: "週2-3回は運動する", axis: "activity_level", value: 4, sub: [{axis:"exercise_commitment",value:4}] },
      { text: "階段で息切れする程度", axis: "activity_level", value: 2, sub: [{axis:"exercise_commitment",value:2}] },
      { text: "動かないのがポリシー", axis: "activity_level", value: 1, sub: [{axis:"exercise_commitment",value:1}] },
    ],
  },
  // Block 2: 人間関係のスタイル（社交性）
  {
    id: 4,
    block: "人間関係のスタイル",
    blockIcon: "👥",
    question: "友人関係のスタイルは？",
    options: [
      { text: "顔が広い。交友関係は広く浅く", axis: "social_style", value: 5, sub: [{axis:"emotional_style",value:3}] },
      { text: "少数の親友と深い付き合い", axis: "social_style", value: 2, sub: [{axis:"emotional_style",value:4}] },
      { text: "基本一人が好き、でも寂しくない", axis: "social_style", value: 1, sub: [{axis:"emotional_style",value:2}] },
      { text: "状況によって使い分ける", axis: "social_style", value: 3, sub: [{axis:"control_desire",value:4}] },
    ],
  },
  {
    id: 5,
    block: "人間関係のスタイル",
    blockIcon: "👥",
    question: "パートナーや家族に求めるものは？",
    options: [
      { text: "常に一緒にいたい、べったり派", axis: "social_style", value: 5, sub: [{axis:"emotional_style",value:5}] },
      { text: "適度な距離感が心地いい", axis: "social_style", value: 3, sub: [{axis:"emotional_style",value:3}] },
      { text: "互いに自立した関係がベスト", axis: "social_style", value: 1.5, sub: [{axis:"emotional_style",value:1.5}] },
      { text: "尽くしたい、世話好きタイプ", axis: "social_style", value: 4, sub: [{axis:"care_commitment",value:5}] },
    ],
  },
  {
    id: 6,
    block: "人間関係のスタイル",
    blockIcon: "👥",
    question: "人に対する第一印象は？",
    options: [
      { text: "誰とでもすぐ仲良くなれる", axis: "social_style", value: 5, sub: [] },
      { text: "最初は様子見、慣れれば打ち解ける", axis: "social_style", value: 3, sub: [] },
      { text: "人見知り、信頼に時間がかかる", axis: "social_style", value: 1.5, sub: [] },
      { text: "相手によってかなり変わる", axis: "social_style", value: 3, sub: [{axis:"control_desire",value:3}] },
    ],
  },
  // Block 3: 生活の価値観（統制欲求・ケア意欲）
  {
    id: 7,
    block: "生活の価値観",
    blockIcon: "💡",
    question: "部屋の状態は？",
    options: [
      { text: "完璧に整理整頓されている", axis: "control_desire", value: 5, sub: [{axis:"care_commitment",value:4}] },
      { text: "まあまあ片付いている", axis: "control_desire", value: 3, sub: [{axis:"care_commitment",value:3}] },
      { text: "カオスだけど自分にはわかる", axis: "control_desire", value: 1.5, sub: [{axis:"care_commitment",value:2}] },
      { text: "散らかるけど定期的に大掃除", axis: "control_desire", value: 2.5, sub: [{axis:"care_commitment",value:3}] },
    ],
  },
  {
    id: 8,
    block: "生活の価値観",
    blockIcon: "💡",
    question: "ルーティンについてどう思う？",
    options: [
      { text: "毎日同じリズムが落ち着く", axis: "control_desire", value: 5, sub: [] },
      { text: "ある程度の規則性は欲しい", axis: "control_desire", value: 3.5, sub: [] },
      { text: "縛られたくない、流れに任せる", axis: "control_desire", value: 1, sub: [] },
      { text: "ルーティンは作るけど破ることも多い", axis: "control_desire", value: 2.5, sub: [] },
    ],
  },
  {
    id: 9,
    block: "生活の価値観",
    blockIcon: "💡",
    question: "植物を育てるのは得意？",
    options: [
      { text: "観葉植物がたくさんあり元気に育っている", axis: "care_commitment", value: 5, sub: [] },
      { text: "いくつかあるけど枯らすこともある", axis: "care_commitment", value: 3, sub: [] },
      { text: "サボテンすら危うい", axis: "care_commitment", value: 1.5, sub: [] },
      { text: "育ててないけど世話は好き", axis: "care_commitment", value: 4, sub: [] },
    ],
  },
  {
    id: 10,
    block: "生活の価値観",
    blockIcon: "💡",
    question: "毎月「推し」や趣味に使える金額は？",
    options: [
      { text: "1万円以下がリアル", axis: "space_budget", value: 1, sub: [] },
      { text: "1〜3万円くらい", axis: "space_budget", value: 2.5, sub: [] },
      { text: "3〜5万円は余裕", axis: "space_budget", value: 4, sub: [] },
      { text: "推しには糸目をつけない", axis: "space_budget", value: 5, sub: [] },
    ],
  },
  // Block 4: 感情と直感（感情スタイル）
  {
    id: 11,
    block: "感情と直感",
    blockIcon: "🎭",
    question: "映画で泣く？",
    options: [
      { text: "号泣する、感情移入が半端ない", axis: "emotional_style", value: 5, sub: [] },
      { text: "感動シーンではうるっとくる", axis: "emotional_style", value: 3.5, sub: [] },
      { text: "めったに泣かない、クール", axis: "emotional_style", value: 1.5, sub: [] },
      { text: "泣くけど人前では見せない", axis: "emotional_style", value: 3, sub: [{axis:"control_desire",value:4}] },
    ],
  },
  {
    id: 12,
    block: "感情と直感",
    blockIcon: "🎭",
    question: "ストレス解消法は？",
    options: [
      { text: "運動で発散！走る、泳ぐ、筋トレ", axis: "emotional_style", value: 4, sub: [{axis:"activity_level",value:5}] },
      { text: "誰かに話を聞いてもらう", axis: "emotional_style", value: 4, sub: [{axis:"social_style",value:4}] },
      { text: "一人で静かに過ごす", axis: "emotional_style", value: 2, sub: [{axis:"social_style",value:1}] },
      { text: "おいしいものを食べる", axis: "emotional_style", value: 3, sub: [{axis:"care_commitment",value:3}] },
    ],
  },
  {
    id: 13,
    block: "感情と直感",
    blockIcon: "🎭",
    question: "動物に対してどう接する？",
    options: [
      { text: "見かけたら駆け寄って触りたい", axis: "emotional_style", value: 5, sub: [{axis:"social_style",value:5}] },
      { text: "かわいいと思うけど距離は取る", axis: "emotional_style", value: 3, sub: [{axis:"social_style",value:2}] },
      { text: "動物の方から来てくれるのが好き", axis: "emotional_style", value: 3.5, sub: [{axis:"control_desire",value:2}] },
      { text: "観察するのが好き、触るより見る派", axis: "emotional_style", value: 2, sub: [{axis:"control_desire",value:3}] },
    ],
  },
  // Block 5: 住環境とライフステージ
  {
    id: 14,
    block: "住環境とライフステージ",
    blockIcon: "🏠",
    question: "現在の住環境は？",
    options: [
      { text: "一戸建て（庭あり）", axis: "space_budget", value: 5, sub: [] },
      { text: "一戸建て（庭なし）/広めのマンション", axis: "space_budget", value: 3.5, sub: [] },
      { text: "普通のマンション・アパート", axis: "space_budget", value: 2, sub: [] },
      { text: "ワンルーム/コンパクト住居", axis: "space_budget", value: 1, sub: [] },
    ],
  },
  {
    id: 15,
    block: "住環境とライフステージ",
    blockIcon: "🏠",
    question: "家族構成は？",
    options: [
      { text: "一人暮らし", axis: "family_structure", value: 1, sub: [{axis:"social_style",value:2}] },
      { text: "パートナーと二人暮らし", axis: "family_structure", value: 2, sub: [] },
      { text: "小さな子供がいる家庭", axis: "family_structure", value: 4, sub: [] },
      { text: "子供が大きい or 多世代家庭", axis: "family_structure", value: 3, sub: [] },
    ],
  },
  {
    id: 16,
    block: "住環境とライフステージ",
    blockIcon: "🏠",
    question: "在宅時間は？",
    options: [
      { text: "ほぼ在宅（リモートワーク等）", axis: "care_commitment", value: 5, sub: [{axis:"social_style",value:3}] },
      { text: "日中は外出、夕方以降は家", axis: "care_commitment", value: 3, sub: [] },
      { text: "出張や外出が多い", axis: "care_commitment", value: 1.5, sub: [] },
      { text: "不規則で読めない", axis: "care_commitment", value: 2, sub: [{axis:"control_desire",value:1}] },
    ],
  },
  {
    id: 17,
    block: "住環境とライフステージ",
    blockIcon: "🏠",
    question: "近所に広い公園やドッグランはある？",
    options: [
      { text: "徒歩圏内にある", axis: "space_budget", value: 4.5, sub: [{axis:"exercise_commitment",value:4}] },
      { text: "車で行ける範囲にある", axis: "space_budget", value: 3, sub: [{axis:"exercise_commitment",value:3}] },
      { text: "あまりない", axis: "space_budget", value: 1.5, sub: [{axis:"exercise_commitment",value:2}] },
      { text: "よく分からない", axis: "space_budget", value: 2, sub: [] },
    ],
  },
  // Block 6: 犬との関わり方の理想
  {
    id: 18,
    block: "犬との理想の関係",
    blockIcon: "🐾",
    question: "犬に一番求めることは？",
    options: [
      { text: "一緒にアクティビティを楽しむ相棒", axis: "activity_level", value: 5, sub: [{axis:"exercise_commitment",value:5}] },
      { text: "寄り添ってくれる癒しの存在", axis: "emotional_style", value: 5, sub: [{axis:"social_style",value:4}] },
      { text: "自立していてクールな関係", axis: "emotional_style", value: 1, sub: [{axis:"social_style",value:1}] },
      { text: "家族の一員、子供の遊び相手", axis: "family_structure", value: 5, sub: [{axis:"social_style",value:5}] },
    ],
  },
  {
    id: 19,
    block: "犬との理想の関係",
    blockIcon: "🐾",
    question: "しつけに対する考えは？",
    options: [
      { text: "きっちり訓練したい、コマンドも教えたい", axis: "control_desire", value: 5, sub: [{axis:"experience",value:4}] },
      { text: "基本的なマナーが身につけばOK", axis: "control_desire", value: 3, sub: [{axis:"experience",value:2}] },
      { text: "自由にのびのび育てたい", axis: "control_desire", value: 1, sub: [{axis:"experience",value:1}] },
      { text: "プロに任せることも考える", axis: "control_desire", value: 3.5, sub: [{axis:"experience",value:2},{axis:"space_budget",value:4}] },
    ],
  },
  {
    id: 20,
    block: "犬との理想の関係",
    blockIcon: "🐾",
    question: "犬の毛のお手入れについて",
    options: [
      { text: "毎日のブラッシングも月1トリミングも楽しめる", axis: "care_commitment", value: 5, sub: [] },
      { text: "週1-2回のブラッシングなら", axis: "care_commitment", value: 3, sub: [] },
      { text: "できるだけ手間がかからない方がいい", axis: "care_commitment", value: 1, sub: [] },
      { text: "お金で解決（トリミングサロンに任せる）", axis: "care_commitment", value: 2.5, sub: [{axis:"space_budget",value:4}] },
    ],
  },
  {
    id: 21,
    block: "犬との理想の関係",
    blockIcon: "🐾",
    question: "吠え声についてどう思う？",
    options: [
      { text: "元気な証拠！気にならない", axis: "social_style", value: 4, sub: [{axis:"space_budget",value:4}] },
      { text: "ある程度は許容できる", axis: "social_style", value: 3, sub: [] },
      { text: "静かな犬がいい（近所迷惑も心配）", axis: "social_style", value: 1.5, sub: [{axis:"space_budget",value:1.5}] },
      { text: "しつけで解決すればいい", axis: "control_desire", value: 4, sub: [{axis:"experience",value:4}] },
    ],
  },
  // Block 7: 深層心理
  {
    id: 22,
    block: "深層心理",
    blockIcon: "🔮",
    question: "もし犬と話せたら、最初に聞きたいことは？",
    options: [
      { text: "「今幸せ？」", axis: "emotional_style", value: 5, sub: [{axis:"care_commitment",value:5}] },
      { text: "「何して遊びたい？」", axis: "activity_level", value: 4.5, sub: [{axis:"social_style",value:4}] },
      { text: "「一人の時間は足りてる？」", axis: "emotional_style", value: 2, sub: [{axis:"social_style",value:1.5}] },
      { text: "「ごはん美味しい？」", axis: "care_commitment", value: 4, sub: [] },
    ],
  },
  {
    id: 23,
    block: "深層心理",
    blockIcon: "🔮",
    question: "SNSに犬の写真を載せる頻度は？（予想）",
    options: [
      { text: "毎日載せる、犬アカ作る勢い", axis: "social_style", value: 5, sub: [{axis:"emotional_style",value:5}] },
      { text: "たまに載せる、いいねが嬉しい", axis: "social_style", value: 3.5, sub: [{axis:"emotional_style",value:3}] },
      { text: "撮るけど載せない、自分だけの宝物", axis: "social_style", value: 1.5, sub: [{axis:"emotional_style",value:3}] },
      { text: "写真はあまり撮らないかも", axis: "social_style", value: 1, sub: [{axis:"emotional_style",value:1}] },
    ],
  },
  {
    id: 24,
    block: "深層心理",
    blockIcon: "🔮",
    question: "犬を擬人化すると、どんなキャラがいい？",
    options: [
      { text: "天真爛漫な弟・妹キャラ", axis: "emotional_style", value: 4.5, sub: [{axis:"social_style",value:5}] },
      { text: "クールでミステリアスな相棒", axis: "emotional_style", value: 1.5, sub: [{axis:"social_style",value:1.5}] },
      { text: "優しくて頼りになるパートナー", axis: "emotional_style", value: 4, sub: [{axis:"care_commitment",value:3}] },
      { text: "自由気ままなマイペース猫タイプ", axis: "emotional_style", value: 2, sub: [{axis:"control_desire",value:1}] },
    ],
  },
  // Block 8: 経験と覚悟
  {
    id: 25,
    block: "経験と覚悟",
    blockIcon: "📚",
    question: "犬の飼育経験は？",
    options: [
      { text: "今まで何頭も飼ったことがある", axis: "experience", value: 5, sub: [] },
      { text: "1頭飼ったことがある", axis: "experience", value: 3, sub: [] },
      { text: "実家で飼っていた（自分が世話人ではない）", axis: "experience", value: 2, sub: [] },
      { text: "犬を飼うのは初めて", axis: "experience", value: 1, sub: [] },
    ],
  },
  {
    id: 26,
    block: "経験と覚悟",
    blockIcon: "📚",
    question: "犬の医療費について",
    options: [
      { text: "ペット保険も入るし、高額医療も覚悟", axis: "space_budget", value: 5, sub: [{axis:"care_commitment",value:5}] },
      { text: "保険は入る、でも限度はある", axis: "space_budget", value: 3.5, sub: [{axis:"care_commitment",value:3}] },
      { text: "あまりお金をかけられない", axis: "space_budget", value: 1.5, sub: [{axis:"care_commitment",value:2}] },
      { text: "考えたことなかった…", axis: "space_budget", value: 1, sub: [{axis:"experience",value:1}] },
    ],
  },
  {
    id: 27,
    block: "経験と覚悟",
    blockIcon: "📚",
    question: "もし犬が問題行動を起こしたら？",
    options: [
      { text: "自分で調べて解決する自信がある", axis: "experience", value: 5, sub: [{axis:"control_desire",value:5}] },
      { text: "トレーナーに相談する", axis: "experience", value: 3, sub: [{axis:"space_budget",value:3}] },
      { text: "ネットで調べて試行錯誤", axis: "experience", value: 2, sub: [{axis:"control_desire",value:3}] },
      { text: "正直不安しかない", axis: "experience", value: 1, sub: [] },
    ],
  },
  // Block 9: ビジュアルと感性
  {
    id: 28,
    block: "ビジュアルと感性",
    blockIcon: "🎨",
    question: "犬のサイズの好みは？",
    options: [
      { text: "小さくて抱っこできるサイズ", axis: "space_budget", value: 1.5, sub: [] },
      { text: "中くらい、ちょうどいいサイズ", axis: "space_budget", value: 3, sub: [] },
      { text: "大きくてハグできるサイズ", axis: "space_budget", value: 4.5, sub: [{axis:"exercise_commitment",value:4}] },
      { text: "サイズにこだわりはない", axis: "space_budget", value: 3, sub: [] },
    ],
  },
  {
    id: 29,
    block: "ビジュアルと感性",
    blockIcon: "🎨",
    question: "他にペットはいる（or 飼う予定）？",
    options: [
      { text: "犬を多頭飼いしたい", axis: "family_structure", value: 5, sub: [{axis:"experience",value:4},{axis:"care_commitment",value:5}] },
      { text: "猫や他の動物がいる", axis: "family_structure", value: 3, sub: [] },
      { text: "犬1頭だけの予定", axis: "family_structure", value: 1.5, sub: [] },
      { text: "まだ決めていない", axis: "family_structure", value: 2, sub: [] },
    ],
  },
  {
    id: 30,
    block: "ビジュアルと感性",
    blockIcon: "🎨",
    question: "最後に、あなたの人生のモットーは？",
    options: [
      { text: "「人生は冒険だ」", axis: "activity_level", value: 5, sub: [{axis:"emotional_style",value:4},{axis:"control_desire",value:1}] },
      { text: "「愛こそすべて」", axis: "emotional_style", value: 5, sub: [{axis:"social_style",value:5},{axis:"care_commitment",value:5}] },
      { text: "「自分らしく生きる」", axis: "control_desire", value: 2, sub: [{axis:"emotional_style",value:3},{axis:"social_style",value:2}] },
      { text: "「石橋を叩いて渡る」", axis: "control_desire", value: 5, sub: [{axis:"experience",value:3},{axis:"care_commitment",value:4}] },
    ],
  },
];

// ============================================================
// マッチングエンジン
// ============================================================
function calcUserProfile(answers) {
  const axes = {
    activity_level: [],
    social_style: [],
    control_desire: [],
    emotional_style: [],
    care_commitment: [],
    space_budget: [],
    experience: [],
    family_structure: [],
    exercise_commitment: [],
  };
  answers.forEach((a) => {
    if (a && a.axis && axes[a.axis]) {
      axes[a.axis].push(a.value);
    }
    if (a && a.sub) {
      a.sub.forEach((s) => {
        if (axes[s.axis]) axes[s.axis].push(s.value);
      });
    }
  });
  const profile = {};
  Object.keys(axes).forEach((k) => {
    const vals = axes[k];
    profile[k] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 3;
  });
  return profile;
}

function matchBreeds(profile) {
  const results = BREED_DATA.map((breed) => {
    const s = breed.scores;
    let score = 0;
    let maxScore = 0;

    // Energy / Activity match
    const actDiff = Math.abs(profile.activity_level - s.energy);
    score += (5 - actDiff) * 3; maxScore += 15;

    // Social match
    const socDiff = Math.abs(profile.social_style - s.sociability);
    score += (5 - socDiff) * 2.5; maxScore += 12.5;

    // Control / Structure match
    const ctrlDiff = Math.abs(profile.control_desire - s.structure_need);
    score += (5 - ctrlDiff) * 2; maxScore += 10;

    // Emotional depth ↔ Patience+Sociability
    const emoTarget = (s.patience + s.sociability) / 2;
    const emoDiff = Math.abs(profile.emotional_style - emoTarget);
    score += (5 - emoDiff) * 2; maxScore += 10;

    // Care commitment ↔ Grooming
    const careDiff = Math.abs(profile.care_commitment - s.grooming_tolerance);
    score += (5 - careDiff) * 2; maxScore += 10;

    // Space/Budget match
    const spaceDiff = Math.abs(profile.space_budget - s.space_need);
    score += (5 - spaceDiff) * 2.5; maxScore += 12.5;

    // Experience match (penalty if low exp + high need breed)
    const expDiff = Math.max(0, s.experience_level - profile.experience);
    score += (5 - expDiff) * 3; maxScore += 15;

    // Exercise match
    const exDiff = Math.abs(profile.exercise_commitment - s.exercise_commitment);
    score += (5 - exDiff) * 2.5; maxScore += 12.5;

    // Family structure bonuses
    if (profile.family_structure >= 3.5 && s.child_friendly >= 4) {
      score += 5; 
    } else if (profile.family_structure >= 3.5 && s.child_friendly <= 2) {
      score -= 5;
    }
    maxScore += 5;

    // Noise sensitivity (low social_style = probably noise-sensitive)
    if (profile.social_style <= 2 && s.noise_tolerance >= 4) {
      score -= 3;
    }

    const pct = Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
    return { ...breed, matchScore: pct };
  });

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

// ============================================================
// ユーザータイプ判定（MBTIライクな4軸）
// ============================================================
function getUserType(profile) {
  const a = profile.activity_level >= 3.5 ? "A" : "S"; // Active vs Still
  const s = profile.social_style >= 3.5 ? "O" : "I"; // Open vs Inner
  const c = profile.control_desire >= 3.5 ? "P" : "F"; // Plan vs Free
  const e = profile.emotional_style >= 3.5 ? "H" : "C"; // Hot vs Cool
  const code = a + s + c + e;

  const typeMap = {
    "AOPH": { name: "太陽のようなリーダー犬タイプ", icon: "☀️", desc: "エネルギッシュで社交的、計画性もあり情熱的。大型活発犬種との相性抜群。犬と一緒に人生を駆け抜けるタイプ。" },
    "AOPF": { name: "冒険家タイプ", icon: "🏔️", desc: "活動的で人付き合いも好き。柔軟で型にはまらない。アウトドア犬種と最高の冒険が待っている。" },
    "AOFH": { name: "情熱のアスリートタイプ", icon: "🔥", desc: "体を動かすのが好きで、深い絆を求める。犬と二人三脚で成長したい人。中〜大型の忠誠心ある犬種が◎。" },
    "AOFF": { name: "自由な風のランナータイプ", icon: "🌪️", desc: "自由奔放でアクティブ。束縛を嫌うが情は深い。独立心のある活発犬種とドライだけど深い関係を築ける。" },
    "AIPH": { name: "情熱の職人タイプ", icon: "⚒️", desc: "活発だけど内向的。計画性があり感情豊か。犬との特別な絆を丁寧に育てたい人。訓練性の高い犬種向き。" },
    "AIPF": { name: "孤高のアスリートタイプ", icon: "🏃", desc: "アクティブで内向的、柔軟。犬と静かに冒険を楽しみたいタイプ。サイトハウンドや独立心のある犬種が◎。" },
    "AIFH": { name: "深い絆の探求者タイプ", icon: "🔍", desc: "活動的だが少数精鋭主義。感情は豊か。犬と二人だけの世界を楽しめる。忠誠心の強い中型犬向き。" },
    "AIFF": { name: "クールな開拓者タイプ", icon: "🗺️", desc: "活動的だが自分の世界を大切に。クールで自由。独立心の強い犬種と理想的なパートナーシップを組める。" },
    "SOPH": { name: "みんなの太陽タイプ", icon: "🌻", desc: "穏やかで社交的、計画性があり愛情深い。小型〜中型の愛玩犬種との相性が最高。家庭犬の理想の飼い主。" },
    "SOPF": { name: "ゆるふわ癒し系タイプ", icon: "☁️", desc: "のんびり屋で人好き、自由なスタイル。穏やかで人懐っこい犬種と最高のリラックスタイムを過ごせる。" },
    "SOFH": { name: "愛情深いケアラータイプ", icon: "💗", desc: "穏やかだが感情豊か。少数の大切な存在に深い愛情を注ぐ。甘えん坊な犬種との相性が抜群。" },
    "SOFF": { name: "マイペースな猫派寄り犬好き", icon: "🐱", desc: "穏やかで自由。犬にも自分のペースを尊重してほしいタイプ。独立心のある小型犬種が合う。" },
    "SIPH": { name: "繊細な愛情家タイプ", icon: "🌙", desc: "静かで内向的だが計画性があり感情豊か。犬との密な関係を大切にする。穏やかな小型犬種向き。" },
    "SIPF": { name: "静かな賢者タイプ", icon: "📖", desc: "落ち着いた内向派で柔軟。犬と静かに寄り添う暮らしが理想。手のかからない穏やかな犬種が◎。" },
    "SIFH": { name: "一途な守護者タイプ", icon: "🛡️", desc: "静かで内向的、感情は豊か。たった一頭の犬に深い愛を注ぎたいタイプ。甘えん坊な犬種と最高の絆。" },
    "SIFF": { name: "ミニマリスト犬好きタイプ", icon: "🪨", desc: "静かで自由、クール。でも犬は好き。手のかからない自立した犬種と心地よい距離感で暮らせる。" },
  };

  return typeMap[code] || { name: "バランスの取れた万能タイプ", icon: "⚖️", desc: "どの犬種とも適応できるバランス型。直感を信じて出会いを大切にしてみて。", code: "BALANCE" };
}

// ============================================================
// UI Components
// ============================================================

// Color palette
const C = {
  bg: "#0a0a0f",
  card: "#13131a",
  cardHover: "#1a1a25",
  accent: "#f0c040",
  accentDim: "#c49a20",
  text: "#e8e6e0",
  textDim: "#8a8880",
  border: "#252530",
  green: "#4ade80",
  red: "#f87171",
  blue: "#60a5fa",
  purple: "#a78bfa",
};

const fonts = `'Zen Maru Gothic', 'Noto Sans JP', sans-serif`;

function ProgressBar({ current, total }) {
  const pct = (current / total) * 100;
  return (
    <div style={{ width: "100%", height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.accent}, ${C.accentDim})`, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)", borderRadius: 2 }} />
    </div>
  );
}

function StartScreen({ onStart }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, padding: "20px", fontFamily: fonts, textAlign: "center", opacity: show ? 1 : 0, transform: show ? "none" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)" }}>
      <div style={{ fontSize: 72, marginBottom: 16, filter: "drop-shadow(0 0 20px rgba(240,192,64,0.3))" }}>🐾</div>
      <h1 style={{ color: C.text, fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
        あなたの<span style={{ color: C.accent }}>運命の犬種</span>、<br/>見つけませんか？
      </h1>
      <p style={{ color: C.textDim, fontSize: "clamp(13px, 3vw, 16px)", maxWidth: 480, lineHeight: 1.7, margin: "12px 0 32px" }}>
        心理学ベースの30問の質問から、<br/>あなたのパーソナリティを8軸で分析。<br/>
        JKC登録50犬種の中から<br/>「一緒に暮らすと幸せになれる犬種」を導き出します。
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
        {["心理学的8軸分析","50犬種データベース","飼育者リアルレビュー","MBTIライクな性格診断"].map((t, i) => (
          <span key={i} style={{ padding: "6px 14px", borderRadius: 20, background: `${C.accent}15`, color: C.accent, fontSize: 12, fontWeight: 600 }}>{t}</span>
        ))}
      </div>
      <button onClick={onStart} style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`, color: C.bg, border: "none", padding: "16px 48px", borderRadius: 12, fontSize: 18, fontWeight: 800, cursor: "pointer", fontFamily: fonts, letterSpacing: "0.05em", boxShadow: `0 4px 20px ${C.accent}40`, transition: "all 0.3s" }} onMouseOver={e => e.target.style.transform = "scale(1.05)"} onMouseOut={e => e.target.style.transform = "scale(1)"}>
        診断をはじめる →
      </button>
      <p style={{ color: C.textDim, fontSize: 11, marginTop: 24, opacity: 0.6 }}>
        所要時間：約5分 ｜ 全30問 ｜ 無料
      </p>
    </div>
  );
}

function QuestionScreen({ question, qIndex, total, onAnswer, onBack }) {
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    setSelected(null);
    setEntering(true);
    const t = setTimeout(() => setEntering(false), 50);
    return () => clearTimeout(t);
  }, [qIndex]);

  const handleSelect = (opt, idx) => {
    setSelected(idx);
    setAnimating(true);
    setTimeout(() => {
      onAnswer(opt);
      setAnimating(false);
    }, 400);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, fontFamily: fonts, opacity: entering ? 0 : 1, transform: entering ? "translateX(30px)" : "none", transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)" }}>
      <div style={{ padding: "16px 20px 0" }}>
        <ProgressBar current={qIndex + 1} total={total} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: C.textDim, fontSize: 14, cursor: "pointer", fontFamily: fonts, padding: "8px 0", opacity: qIndex > 0 ? 1 : 0, pointerEvents: qIndex > 0 ? "auto" : "none" }}>← 戻る</button>
          <span style={{ color: C.textDim, fontSize: 13, fontWeight: 600 }}>{qIndex + 1} / {total}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 20px 40px", maxWidth: 560, margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.accent, fontWeight: 700, letterSpacing: "0.1em" }}>
            {question.blockIcon} {question.block}
          </span>
        </div>
        <h2 style={{ color: C.text, fontSize: "clamp(20px, 4.5vw, 28px)", fontWeight: 800, margin: "0 0 28px", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
          {question.question}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button key={i} onClick={() => handleSelect(opt, i)} disabled={animating} style={{
                background: isSelected ? `${C.accent}20` : C.card,
                border: `1.5px solid ${isSelected ? C.accent : C.border}`,
                borderRadius: 12,
                padding: "16px 20px",
                color: isSelected ? C.accent : C.text,
                fontSize: "clamp(14px, 3.5vw, 16px)",
                fontWeight: isSelected ? 700 : 500,
                cursor: "pointer",
                fontFamily: fonts,
                textAlign: "left",
                transition: "all 0.25s",
                transform: isSelected ? "scale(0.98)" : "none",
                opacity: animating && !isSelected ? 0.4 : 1,
              }}>
                <span style={{ marginRight: 12, opacity: 0.5, fontSize: 14 }}>
                  {["A", "B", "C", "D"][i]}
                </span>
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RadarChart({ profile, size = 280 }) {
  const axes = [
    { key: "activity_level", label: "活動性" },
    { key: "social_style", label: "社交性" },
    { key: "emotional_style", label: "情熱度" },
    { key: "care_commitment", label: "ケア意欲" },
    { key: "control_desire", label: "計画性" },
    { key: "experience", label: "経験値" },
    { key: "space_budget", label: "環境充実度" },
    { key: "exercise_commitment", label: "運動力" },
  ];
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const getPoint = (i, val) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    const dist = (val / 5) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };
  const polygonPoints = axes.map((a, i) => {
    const p = getPoint(i, profile[a.key] || 3);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", margin: "0 auto" }}>
      {[1, 2, 3, 4, 5].map(level => (
        <polygon key={level} points={axes.map((_, i) => { const p = getPoint(i, level); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke={C.border} strokeWidth={level === 5 ? 1.5 : 0.5} opacity={0.6} />
      ))}
      {axes.map((_, i) => {
        const p = getPoint(i, 5);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={C.border} strokeWidth={0.5} opacity={0.4} />;
      })}
      <polygon points={polygonPoints} fill={`${C.accent}25`} stroke={C.accent} strokeWidth={2} />
      {axes.map((a, i) => {
        const p = getPoint(i, profile[a.key] || 3);
        return <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={4} fill={C.accent} />;
      })}
      {axes.map((a, i) => {
        const p = getPoint(i, 5.8);
        return (
          <text key={`label-${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill={C.textDim} fontSize={11} fontWeight={600} fontFamily={fonts}>
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}

function BreedCard({ breed, rank, expanded, onToggle }) {
  const barColor = breed.matchScore >= 80 ? C.green : breed.matchScore >= 60 ? C.accent : breed.matchScore >= 40 ? C.blue : C.textDim;
  return (
    <div style={{ background: C.card, border: `1px solid ${rank <= 3 ? C.accent + "40" : C.border}`, borderRadius: 16, overflow: "hidden", transition: "all 0.3s" }}>
      <div onClick={onToggle} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: rank <= 3 ? `${C.accent}20` : `${C.border}80`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          {breed.img}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ color: rank <= 3 ? C.accent : C.textDim, fontSize: 12, fontWeight: 800 }}>#{rank}</span>
            <span style={{ color: C.text, fontSize: "clamp(14px, 3.5vw, 16px)", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{breed.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${breed.matchScore}%`, height: "100%", background: barColor, borderRadius: 3, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
            </div>
            <span style={{ color: barColor, fontSize: 14, fontWeight: 800, minWidth: 40, textAlign: "right" }}>{breed.matchScore}%</span>
          </div>
        </div>
        <span style={{ color: C.textDim, fontSize: 18, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>▾</span>
      </div>

      {expanded && (
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0 12px" }}>
            <span style={{ padding: "4px 10px", borderRadius: 8, background: `${C.blue}20`, color: C.blue, fontSize: 11, fontWeight: 600 }}>{breed.size}</span>
            {breed.tags.map((t, i) => (
              <span key={i} style={{ padding: "4px 10px", borderRadius: 8, background: `${C.purple}15`, color: C.purple, fontSize: 11, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: "12px 0" }}>{breed.summary}</p>
          <div style={{ background: `${C.border}60`, borderRadius: 10, padding: 14, marginTop: 12 }}>
            <p style={{ color: C.accent, fontSize: 12, fontWeight: 700, margin: "0 0 6px" }}>⚠️ かかりやすい病気</p>
            <p style={{ color: C.textDim, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{breed.health.join("、")}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            {[
              { label: "エネルギー", val: breed.scores.energy },
              { label: "しつけ難度", val: breed.scores.experience_level },
              { label: "お手入れ", val: breed.scores.grooming_tolerance },
              { label: "子供との相性", val: breed.scores.child_friendly },
            ].map((item, i) => (
              <div key={i} style={{ background: `${C.border}40`, borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>{item.label}</div>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ width: 16, height: 6, borderRadius: 3, background: n <= item.val ? C.accent : C.border }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultScreen({ profile, userType, results, onRestart }) {
  const [show, setShow] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(0);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  const top3 = results.slice(0, 3);
  const rest = results.slice(3, 15);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: fonts, opacity: show ? 1 : 0, transition: "opacity 0.8s", paddingBottom: 60 }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "40px 20px 20px" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{userType.icon}</div>
        <p style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", margin: "0 0 8px" }}>YOUR DOG PERSONALITY TYPE</p>
        <h1 style={{ color: C.text, fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, margin: "0 0 12px", lineHeight: 1.3 }}>{userType.name}</h1>
        <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>{userType.desc}</p>
      </div>

      {/* Radar */}
      <div style={{ padding: "20px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ background: C.card, borderRadius: 16, padding: "24px 16px", border: `1px solid ${C.border}` }}>
          <h3 style={{ color: C.text, fontSize: 15, fontWeight: 700, textAlign: "center", margin: "0 0 16px" }}>あなたのパーソナリティマップ</h3>
          <RadarChart profile={profile} />
        </div>
      </div>

      {/* Top 3 */}
      <div style={{ padding: "20px", maxWidth: 560, margin: "0 auto" }}>
        <h3 style={{ color: C.accent, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", margin: "0 0 4px" }}>🏆 BEST MATCH TOP 3</h3>
        <p style={{ color: C.textDim, fontSize: 12, margin: "0 0 16px" }}>あなたと最も幸せに暮らせる犬種</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {top3.map((breed, i) => (
            <BreedCard key={breed.name} breed={breed} rank={i + 1} expanded={expandedIdx === i} onToggle={() => setExpandedIdx(expandedIdx === i ? -1 : i)} />
          ))}
        </div>
      </div>

      {/* Runner ups */}
      <div style={{ padding: "0 20px 20px", maxWidth: 560, margin: "0 auto" }}>
        <h3 style={{ color: C.text, fontSize: 14, fontWeight: 700, margin: "24px 0 12px" }}>こちらもおすすめ</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rest.map((breed, i) => (
            <BreedCard key={breed.name} breed={breed} rank={i + 4} expanded={expandedIdx === i + 3} onToggle={() => setExpandedIdx(expandedIdx === i + 3 ? -1 : i + 3)} />
          ))}
        </div>
      </div>

      {/* Disclaimer + Restart */}
      <div style={{ padding: "20px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ background: `${C.accent}10`, borderRadius: 12, padding: 16, marginBottom: 24, border: `1px solid ${C.accent}20` }}>
          <p style={{ color: C.accent, fontSize: 12, fontWeight: 700, margin: "0 0 8px" }}>🐾 ラーテル犬舎からのメッセージ</p>
          <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            この診断はあくまで参考です。犬種の特徴は個体差があり、育て方や環境によっても大きく変わります。
            実際に迎える前に、ブリーダーや保護団体との対話を通じて「この子」との相性を感じてください。
            犬との暮らしは、お互いが幸せであることが一番大切です。
          </p>
        </div>
        <button onClick={onRestart} style={{ background: "none", border: `1.5px solid ${C.border}`, color: C.textDim, padding: "12px 32px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: fonts, transition: "all 0.3s" }} onMouseOver={e => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }} onMouseOut={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textDim; }}>
          もう一度診断する
        </button>
        <p style={{ color: C.textDim, fontSize: 11, marginTop: 16, opacity: 0.5 }}>
          Powered by ラーテル犬舎 × JKC 50犬種データ
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Main App
// ============================================================
export default function DogMatchApp() {
  const [screen, setScreen] = useState("start"); // start | quiz | result
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleStart = () => {
    setScreen("quiz");
    setQIndex(0);
    setAnswers([]);
  };

  const handleAnswer = (opt) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = opt;
    setAnswers(newAnswers);
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      setScreen("result");
    }
  };

  const handleBack = () => {
    if (qIndex > 0) setQIndex(qIndex - 1);
  };

  const profile = useMemo(() => calcUserProfile(answers), [answers]);
  const userType = useMemo(() => getUserType(profile), [profile]);
  const results = useMemo(() => matchBreeds(profile), [profile]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; -webkit-font-smoothing: antialiased; }
        button:active { transform: scale(0.97) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
      `}</style>
      {screen === "start" && <StartScreen onStart={handleStart} />}
      {screen === "quiz" && (
        <QuestionScreen
          question={QUESTIONS[qIndex]}
          qIndex={qIndex}
          total={QUESTIONS.length}
          onAnswer={handleAnswer}
          onBack={handleBack}
        />
      )}
      {screen === "result" && (
        <ResultScreen
          profile={profile}
          userType={userType}
          results={results}
          onRestart={handleStart}
        />
      )}
    </>
  );
}
