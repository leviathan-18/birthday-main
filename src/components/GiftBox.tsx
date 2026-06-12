"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Mail, X, BookOpen, Sparkles } from "lucide-react";

interface GiftBoxProps {
  collectedKeysCount: number;
  onOpenSuccess: () => void;
}

interface Letter {
  id: string;
  title: string;
  content?: string;
  pages?: string[];
}

export default function GiftBox({ collectedKeysCount, onOpenSuccess }: GiftBoxProps) {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [quizError, setQuizError] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showRedGlow, setShowRedGlow] = useState(false);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    setCurrentPage(0);
  }, [activeLetter]);

  const letters: Letter[] = [
    {
      id: "letter-1",
      title: "My Moon Fr",
      pages: [
        `You are an angel from heaven. I'm not worthy of your love!
But one thing i can say withtout even thinking twice that you are never be unloved by me!

If i had a thousand lives, i will wish to love you in every one of them.
And if i had none, then there's no one to love you, the way i do.
And only Allah knows, how much i like you.

Do you know what i wish for,
Your presence in my life,
And I never gave my heart to anyone, because my heart is willingly with you.
Take the whole heart, I'm not keeping it for anyone, but you! 🤍`,

        `You frequently asked me about yourself that ,what i liked about you, I tried to describe you, but every metaphor felt short,
Even the stars are just dust, compared to light in your eyes.

And every time you say, go find someone else, I'm not the one you should admire.
So i have to tell you that,What will I do with a whole garden if my favourite flower isn't there!

If God give me power to write my destiny by myself, then, I would simply write your name and break the pen.

You said that, you are not good enough,not beautiful enough,then i thought of this one, that- 
Kabhi tum nadaan , kabhi tum sachchi lgti ho.
Kabhi tum masoom toh kabhi bachchi lgti ho.
Harr cheez apni waqt or achchi lgti h,aur ek tum ho jo mujhe har waqt achchi lgti ho.`,

        `From the day first, When i see you ,I knew you are the missing piece of my life, You complete me!
I know one thing that,Whatever our souls are made of, hers and mine are the same.
Its always been you, always.

In the most selfish way possible, I hope nobody admires you the way I do.`
      ]
    },
    {
      id: "letter-2",
      title: "Pieces of You",
      pages: [
        `Agar aaj koi mujhse pooche ki main aapse itni mohabbat kyun karta hoon, toh mere paas koi wajah nahi hai. Maine kahin suna tha ki jis se tum sachche dil se pyaar karte ho, use chahne ki koi wajah nahi hoti. Aur us shakhs ki mohabbat bhi aapke liye zaroori nahi hoti... aap bas uske liye har hadd se guzar jaane ki chaah rakhte hain, chahe woh aapko pasand kare ya na kare.

Maine in 5 saalon me kya kya imagine nhi kiya ki Farheen hoti toh aisa hota hum ye krte,jaise baarish me hum gaadi lekr ghumne nikla jaynge bheegte hue, fir aisa hoga, thandi hogi toh hum aisa krenge, Eid hogi toh ek jaise kapde pahenge, ek doosre ke ghar jaynge saath saath. 
Duniya ghoomenge ek saath, bina kisi ke parwah kiye hue bgair, aur bhi boht kuch.
Aur yahi cheezein mere khwaabon me bhi aati hein aaj bhi, aur uss pal aisa lgta h sb sach h, main iss duniya ka sbse khush naseeb ensaan ban gya hu.
Khwaab hi sahi,km se km aapse mulaqat toh kr paata hu,jo asliyat se km nhi lgta.`,

        `Khwaab ho ya haqeeqat, dono jahan me main aapko dekhta hu  toh meri aankhein bhar aati hein,mohabbat se hmesha, chahe pehli baar dekhu ya hazar bhar.

Asliyat ye h ke-
Yu toh kitne haseen chehre hein, mgr main sirf tumhara chehra dekhna chahunga.
Woh dekhe apne apne chand ko, main sirf tumhari aankhein dekhna chahunga.
Woh khwaab jisme tum nazar aao, wih khwaab main hrr roz dekhna chahunga.

Aapke sath bitaya hua aur aapse baat kiya hua har ek second mere liye ek haseen khwaab jaisa hi hai aur hamesha rahega. Farheen ab jaanti hai ki main kaun hoon aur main unke liye kya mehsoos karta hoon... mere liye is se badh kar koi khushi nahi ho sakti.`,

        `Aur shukr guzaar hu ,apni behn ka aur huma appi ka aur sbse zyada aapka , jinhone mujhe smjha wrna aaj bhi ,kuch na badalta, meri ksimat me aaj bhi Farheen ko dekhna naseeb na hota.

Ek sher h ke,
Main tumhari aankhon me pyar bnke rehta hu , noor bnke basta hu,khwaab bnke zinda hun.
Mere saare khwaab in jameel aankhon ke ek koshe me tum chhupa kr rakh lena.
Aur kabhi ye khwaab phool bnke maheke toh, inke khushbuo mein tum mere naam ke sb harf ehtiyat se rkhna💖.`
      ]
    },
    {
      id: "letter-3",
      title: "I found You",
      pages: [
        `Assalam o Alaikum!
Kabhi kabhi zindagi ki mamuli raahon mein mohabbat yun milti hai jaise koi khwaab achanak haqeeqat ban gaya ho... bilkul waise hi, jaise aap mujhe mili.

Aapko shayad yeh lagta hai ki maine aapko sab se pehle 11th class mein dekha tha, par yeh poora sach nahi hai. Wahan toh maine aapko doosri dafa dekha tha. Pehli dafa toh hamari mulaqat Kamhariya ke Urs mein hui thi. Shayad is baat par kisi ko yaqeen na aaye, par main chahunga ki aap yaqeen karein, kyunki aap jaanti hain ki main aapse kabhi jhooth nahi kehta.`,

        `Jab main 7th class mein tha, tab doston ke sath pehli baar Kamhariya ke Urs mein gaya tha. Wahan jhoolon wale ground mein aapke sath paanch aur log the. Main aapke peeche-peeche gate tak bhi gaya tha. Phir jab aap auto mein baithi toh maine dekha ki aap sab kisi aur raah par ja rahe hain, tab mujhe samajh aaya ki yahan paas hi ek aur gaon hai—Mancha. Tab pehli baar maine 'Mancha' ka naam suna tha.

Us din se pehle mujhe koi pasand nahi aaya tha, aur us umar mein waise bhi pasand-napasand ki samajh kahan hoti hai? Par kaafi dinon tak main aapke baare mein sochta raha... khayaalon mein na jaane kya kya sochta. Khair, aapka chehra kabhi mere zehn se nahi utra. Jab bhi main us pal ko yaad karta, toh dil ke andar ek ajeeb si thandi hawa chalne lagti thi, par mujhe samajh nahi aata tha ki yeh kya hai aur kyun hai.`,

        `Phir poore chaar saal baad, 17 December ko Rehmaniya mein jab humara pehla exam tha, maine aapko dobara dekha. Aapko dekhte hi meri saans jaise ruk si gayi! Maine ek pal mein pehchan liya ki yeh wahi ladki hai jo Kamhariya ke Urs mein mili thi, jiska chehra main kabhi bhula nahi paya tha. Us din exam mein main kya likh kar aaya tha, mujhe khud nahi pata. Mujhe bas itna yaad hai ki Hindi ka paper tha, aap right side baithi thi aur main left side, aur main poore waqt bas chupke se aapko dekhta raha.

Jab exam khatam hua, toh main neeche khada aapka intezaar karta raha ki aap aayengi toh dekhunga aap kahan ja rahi hain. Us din aapko dekh kar mujhe samajh aa gaya tha ki maine chahte na chahte aapse aisi mohabbat kar li hai jiski mujhe khud khabar nahi thi.`,

        `Main aapko is baar khona nahi chahta tha, isliye main aapke peeche-peeche Uprasu tak gaya. Agle paper mein Malikua tak gaya. Ladkon se pata kiya ki aapki coaching kahan hai, kis time hai, Faheem sir, saleem sir, Tufail sir, Naaz maam sab kuch.

Jab pata chala ki aap Naaz Ma'am ke yahan padhti hain. Ek din maine coaching ke baahar baith kar dekha ki aap kis batch mein aati hain. Jab aap subah 10 bje dikhayi deen, toh maine jaise-taise bahane bana kar Naaz Ma'am se subah ki coaching lagwa li. Maine ma'am se kaha ki main shaam ko nahi aa sakta, jabki sach toh yeh tha ki main chemistry already Mujeeb Sir se padh raha tha. Ab mere haath-pair kaanp rahe the ki kal se aapke sath baithna hai, samajh nahi aa raha hai kya karu.`,

        `Himmat karke coaching gaya aur bilkul aapke peeche  baithta tha. Wahan maine dekha ki humari Modern ki classmate ladkiyan bhi padhti hain. Maine socha shayad in se kahun toh kuch baat ban jaye, kyunki direct aapse baat karne ki meri himmat hi nahi thi. Mujhe darr tha ki agar maine seedhe poocha toh aap mana kar dengi. Maine ladkiyon se kaha ki meri baat karwao aur sab se pehle is ladki ka naam pata karo. Mahina hone ko aaya tha, par poori duniya mein kisi ko is ladki ka naam hi nahi pata tha, na woh kisi se bolti thi.

Kayi din guzar gaye, na aapki aawaz suni na naam pata chala. Main bas aapko aate-jaate dekhta rehta. Is chakkar mein mujhe baqi sab ke naam pata chal gaye—ki Huma Appi yeh hain, Sakshi yeh hain... par aapka naam raaz hi raha.`,

        `Phir ek din class mein ma'am ne achanak naam liya, "Farheen, samajh mein aa raha hai?" Tab mujhe pehli baar aapka naam pata chala!
Magar aawaz maine tab bhi nahi suni thi. Mujhe toh lagne laga tha ki kahin aap gongi toh nahi hain ki itne dinon mein ek lafz nahi bolin. Phir koi daswein din ma'am ne kaha, "Farheen, kuch bologi ya bas sunti rahogi? Achha, is formula ka naam batao." Tab maine zindagi mein pehli baar aapki aawaz suni thi, jab aapne kaha, "Ma'am, nahi pata 🥲."

Mujhe aapki har coaching aur har timing ka pata chal chuka hai, lekin aapne kabhi nazar utha kar nahi dekha. Main jaanta tha aap kabhi nahi dekhengi. Pata nahi kyun, par aapko dekh kar mujhe hamesha aisa lagta tha jaise main aapko hmesha se jaanta hoon, aapki har baat se waqif hoon. Mere liye kuch bhi naya nahi tha.`,

        `Us waqt Allah ne mujhe himmat nahi di, balki sabr diya. Maine boht koshish ki kisi tarah baat ho jaye, par na ho saki, yahan tak ki aapko khabar tak na hui ki koi 'Aahil' bhi is duniya mein maujood hai.

Lekin ek baat main zaroor kahunga ki aapse milne ke baad, main pehle jaisa nahi raha. Main baqi ladkon jaisa nahi tha jo har kisi se dil laga lete hain. Mere iraade aapko lekar hamesha bilkul paak aur nek the. Jab upar wale ne humein dobara milwaya, toh mujhe laga ki khuda milwata hi unse hai jinse kismat bandhi hoti hai. Par jab ummeed tooti, toh dil mein bade sawaal aaye... kya upar wale ko sirf main hi bura dikhta hoon? Mere sath hi aisa kyun hota hai? Main toh kisi ka bura nahi chahta, phir bhi jis ek shakhs ko maine sbse zyada chaha, woh mera na ho saka. Main boht roya, boht duayein kien, minnatein kien, par kuch na badla.`,

        `Mera roll number 1 tha, toh galti se Rehmaniya mein practicals ke dauran main ladkiyon wale section mein chala gaya. Main akela ladka tha jo Rehmaniya mein practical de raha tha. Gandhi College se gaadi utha kar nikla aur raste mein sirf ek hi baat soch raha tha—ki shayad upar wale ne yeh galti mere liye hi karwayi hai, taaki main FARHEEN ko aakhiri baar dekh sakoon. Kyunki us din ke baad shayad main aapko kabhi na dekh pata.

Jaise hi pahuncha, maine sab se pehle aapko dhoondha. Aap sab se peeche wali bench par baithi thi. Us din jo maine mehsoos kiya, zindagi mein kabhi aisi ajeeb feeling mehsoos nahi ki thi. Aap meri aankhon ke saamne thi, par main kuch keh nahi paa raha tha. Main jaanta tha agar aaj na kaha toh shayad zindagi bhar aapka chehra nahi dekh paunga. Main bas aapko dekh raha tha aur meri aankhon mein aansu the. Bilkul shiddat se, maine mann bhar ke aapko dekha... jitna main dekh sakta tha.`,

        `Jab main aakhiri practical de kar baahar aaya, toh ladkiyon ki line lagi hui thi. Maine aakhiri baar poori mohabbat se aapki taraf dekha aur dil hi dil mein alwida kaha. Kyunki main jaanta tha main aapko zindagi bhar nahi bhula sakta, bhale hi mera naseeb aisa ho ki aapko mera naam tak na pata ho... ya yeh na pata ho ki koi shakhs sirf aapke is duniya mein hone se kitni mohabbat karta hai.`
      ]
    },
  ];

  const handleBoxClick = () => {
    if (collectedKeysCount < 3) {
      // Trigger vibration shake and red glow flash
      setIsShaking(true);
      setShowRedGlow(true);
      setTimeout(() => {
        setIsShaking(false);
        setShowRedGlow(false);
      }, 500);
      return;
    }

    if (!isOpened) {
      setIsQuizOpen(true);
    }
  };

  const handleQuizSubmit = () => {
    if (inputValue.trim() === "14") {
      setIsQuizOpen(false);
      setIsOpened(true);
      onOpenSuccess();
      triggerSparkFountain();
    } else {
      setQuizError(true);
      setTimeout(() => setQuizError(false), 2000);
    }
  };

  // Spark Fountain canvas particle engine
  const triggerSparkFountain = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = canvas.parentElement?.clientHeight || 400;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
    }

    const particles: Particle[] = [];
    const colors = ["#FBBF24", "#EC4899", "#A78BFA", "#F472B6", "#FFFFFF"];

    const spawnParticles = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height - 40;
      for (let i = 0; i < 6; i++) {
        particles.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy,
          vx: (Math.random() - 0.5) * 5,
          vy: -(Math.random() * 8 + 4),
          size: Math.random() * 3.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: Math.random() * 0.015 + 0.008,
        });
      }
    };

    let elapsedFrames = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsedFrames < 120) {
        spawnParticles();
      }

      elapsedFrames++;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.x < 0 || p.x > canvas.width || p.y > canvas.height) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        const safeR = Math.max(0.1, isFinite(p.size) ? p.size : 0.1);
        ctx.arc(p.x, p.y, safeR, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = canvas.width >= 768 ? p.size * 2 : 0;
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
  };

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <section id="gift-box" className="w-full py-28 bg-[#030304] border-t border-glass relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[200px] md:w-[600px] md:h-[400px] bg-amber-500/5 rounded-full blur-[50px] md:blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-40 h-40 md:w-80 md:h-80 bg-pink-glow/5 rounded-full blur-[45px] md:blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center gap-8 select-none w-full">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 shadow-inner">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-sans text-[10px] tracking-widest text-text-secondary uppercase">
              Final Milestone
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-tight mt-1 text-glow">
            The Locked Gift Box
          </h2>
          <p className="text-xs md:text-sm font-sans text-text-secondary max-w-md leading-relaxed mt-1">
            {isOpened
              ? "The box has unlocked. Click any of the letters inside to read the private letters."
              : "Explore the website and find all 3 hidden keys. Once you have them, you can open the gift and reveal the surprise inside."}
          </p>
        </div>

        {/* Gift Box Display Area */}
        <div className="relative w-72 h-80 flex flex-col items-center justify-center">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />

          <motion.div
            animate={isShaking ? { 
              x: [-8, 8, -6, 6, -3, 3, 0],
              rotate: [-2, 2, -1.5, 1.5, -1, 1, 0]
            } : {}}
            transition={{ duration: 0.5 }}
            onClick={handleBoxClick}
            className={`relative z-10 transition-all duration-300 flex flex-col items-center gap-4 ${
              collectedKeysCount >= 3 
                ? "cursor-pointer hover:scale-105 active:scale-95" 
                : "cursor-pointer hover:scale-102"
            }`}
            style={{
              filter: showRedGlow ? "drop-shadow(0 0 25px rgba(239, 68, 68, 0.75))" : undefined
            }}
          >
            {/* SVG Gift box */}
            <svg viewBox="0 0 100 100" className="w-52 h-52 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
              <defs>
                <linearGradient id="gold-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE082" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#AA7C11" />
                </linearGradient>
              </defs>

              {/* Box shadow */}
              <ellipse cx="50" cy="85" rx="32" ry="6" fill="rgba(0,0,0,0.5)" />

              {/* Box Base */}
              <rect x="25" y="45" width="50" height="35" rx="4" fill="#580C1F" stroke="#3D000F" strokeWidth="1" />

              {/* Box Lid */}
              <motion.rect
                animate={isOpened ? { y: -20, opacity: 0 } : {}}
                transition={{ duration: 0.8 }}
                x="22"
                y="38"
                width="56"
                height="10"
                rx="2"
                fill="#7209B7"
                stroke="#3D000F"
                strokeWidth="1"
              />

              {/* Gold Ribbon Vertical */}
              <rect x="46" y="45" width="8" height="35" fill="url(#gold-ribbon)" />
              <motion.rect
                animate={isOpened ? { y: -20, opacity: 0 } : {}}
                transition={{ duration: 0.8 }}
                x="46"
                y="38"
                width="8"
                height="10"
                fill="url(#gold-ribbon)"
              />

              {/* Gold Ribbon Horizontal */}
              <rect x="25" y="60" width="50" height="5" fill="url(#gold-ribbon)" />

              {/* Ribbon Bow */}
              <motion.g
                animate={isOpened ? { y: -30, opacity: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <path d="M 50,38 C 45,30 35,32 46,38 Z" fill="url(#gold-ribbon)" stroke="#D4AF37" strokeWidth="0.5" />
                <path d="M 50,38 C 55,30 65,32 54,38 Z" fill="url(#gold-ribbon)" stroke="#D4AF37" strokeWidth="0.5" />
              </motion.g>

              {/* Lock status visual badge */}
              {!isOpened && (
                <g transform="translate(42, 53) scale(0.6)">
                  <rect x="5" y="10" width="16" height="12" rx="2" fill={collectedKeysCount >= 3 ? "#10B981" : "#EF4444"} />
                  <path
                    d={collectedKeysCount >= 3 ? "M 8,10 L 8,7 C 8,4.5 10,4.5 13,4.5 C 16,4.5 18,4.5 18,7" : "M 8,10 L 8,6 C 8,3.5 10,2.5 13,2.5 C 16,2.5 18,3.5 18,6 L 18,10"}
                    fill="none"
                    stroke={collectedKeysCount >= 3 ? "#10B981" : "#EF4444"}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="13" cy="15" r="1.5" fill="#FFF" />
                </g>
              )}
            </svg>

            {/* Lock / Unlock State Instructions */}
            <div className="flex flex-col items-center">
              {isOpened ? (
                <span className="text-pink-glow text-xs uppercase tracking-widest font-sans flex items-center gap-1.5 font-bold">
                  <Unlock className="w-3.5 h-3.5" /> Box Opened!
                </span>
              ) : collectedKeysCount >= 3 ? (
                <span className="text-emerald-400 text-xs uppercase tracking-widest font-sans flex items-center gap-1.5 font-bold animate-pulse">
                  <Unlock className="w-3.5 h-3.5 animate-bounce" /> Click to Unlock Box
                </span>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-rose-500 text-xs uppercase tracking-widest font-sans flex items-center gap-1.5 font-semibold">
                    <Lock className="w-3.5 h-3.5" /> Locked ({collectedKeysCount}/3 Keys)
                  </span>
                  <span className="text-[9px] font-sans text-text-secondary tracking-widest uppercase">
                    Find the 3 hidden keys to unlock
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Opened Box Letters Reveal UI */}
        <AnimatePresence>
          {isOpened && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-8"
            >
              {letters.map((letter) => (
                <motion.div
                  key={letter.id}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => setActiveLetter(letter)}
                  className="p-6 rounded-2xl bg-white/5 border border-[#D9C4A9]/20 hover:border-amber-300/40 cursor-pointer flex flex-col items-center justify-between text-center gap-4 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-300/20 group-hover:border-amber-300/50 transition-all duration-300">
                    <Mail className="w-5 h-5 text-amber-300" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="font-serif text-white group-hover:text-amber-300 transition-colors duration-300 text-base">
                      {letter.title}
                    </h4>
                  </div>

                  <span className="text-[9px] font-sans uppercase tracking-widest text-amber-300/80 group-hover:text-amber-200 flex items-center gap-1">
                    <BookOpen className="w-3" /> Read Letter
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quiz Modal Overlay */}
      <AnimatePresence>
        {isQuizOpen && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setIsQuizOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="relative max-w-md w-full p-8 rounded-3xl border border-glass bg-[#121114] shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col gap-6"
            >
              <button
                onClick={() => setIsQuizOpen(false)}
                className="absolute top-5 right-5 text-text-secondary hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-pink-glow/10 flex items-center justify-center border border-pink-glow/20">
                  <Sparkles className="w-5 h-5 text-pink-glow animate-pulse" />
                </div>
                <h3 className="font-serif text-xl text-white mt-2">One Last Question...</h3>
                <p className="text-xs text-text-secondary font-sans tracking-wide">(Chudi ka size × 20) - (Ring ka size × 3) + (Sandal ka size × 2)</p>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter your answer"
                  className="w-full p-4 rounded-xl border bg-white/5 border-white/5 text-white placeholder:text-text-secondary/50 font-sans text-xs tracking-wider transition-all duration-300 focus:outline-none focus:border-white/20 focus:bg-white/10"
                />
              </div>

              {quizError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-rose-500 font-sans text-[10px] uppercase tracking-widest font-semibold"
                >
                  Not quite. Try again.
                </motion.div>
              )}

              <button
                onClick={handleQuizSubmit}
                disabled={!inputValue.trim()}
                className="mt-2 w-full py-3 rounded-full bg-white/95 text-neutral-950 font-sans font-bold text-xs uppercase tracking-widest hover:bg-white active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
              >
                Submit Answer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fully Typewriter Styled Fullscreen Diary Reader Overlay */}
      <AnimatePresence>
        {activeLetter && (
          <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-lg">
            <div className="absolute inset-0" onClick={() => setActiveLetter(null)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
              transition={{ duration: 0.4 }}
              className="relative max-w-2xl w-full p-6 md:p-10 rounded-3xl border border-[#D9C4A9]/30 bg-[#161517] bg-gradient-to-tr from-[#161517] via-[#1E1C1F] to-[#161517] shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col gap-5"
            >
              <button
                onClick={() => setActiveLetter(null)}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/5 border border-[#D9C4A9]/20 text-text-secondary hover:text-white transition-all duration-300 z-50 pointer-events-auto active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute inset-4 border border-[#D9C4A9]/10 rounded-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#D9C4A9]/10 pb-4 z-10">
                <span className="font-serif italic text-sm text-pink-glow">
                  {activeLetter.title}
                </span>
              </div>

              {/* Letter content in Typewriter typewriter font layout */}
              <div className="font-serif italic text-xs md:text-sm text-white/95 leading-relaxed whitespace-pre-wrap text-left z-10">
                {activeLetter.pages ? (
                  <>
                    {activeLetter.pages[currentPage]}
                    {activeLetter.id === "letter-1" && currentPage === 2 && (
                      <div className="mt-4 flex flex-col gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src="/images/sketch.png" 
                          alt="Sketch illustration" 
                          className="max-h-[160px] object-contain rounded-xl border border-white/10 shadow-lg mx-auto"
                        />
                        <div className="text-glow font-bold text-sm md:text-base text-center text-white/95">
                          I loved you, I love you, I will love you!
                        </div>
                      </div>
                    )}
                    {activeLetter.id === "letter-2" && currentPage === 2 && (
                      <div className="mt-4 flex flex-col gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src="/images/roses.png" 
                          alt="Roses painting" 
                          className="max-h-[160px] object-contain rounded-xl border border-white/10 shadow-lg mx-auto"
                        />
                        <div className="text-glow font-bold text-sm md:text-base text-center text-white/95">
                          In every verse, I Always choose you!
                        </div>
                      </div>
                    )}
                    {activeLetter.id === "letter-3" && currentPage === 8 && (
                      <div className="mt-4 flex flex-col gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src="/images/angel.png" 
                          alt="Angel illustration" 
                          className="max-h-[160px] object-contain rounded-xl border border-white/10 shadow-lg mx-auto"
                        />
                        <div className="text-glow font-bold text-sm md:text-base text-center text-white/95">
                          في الدنيا والآخرة
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  activeLetter.content
                )}
              </div>

              <div className="flex justify-between mt-4 items-center border-t border-[#D9C4A9]/10 pt-4 z-10">
                <div>
                  {activeLetter.pages && activeLetter.pages.length > 1 && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="text-xs uppercase tracking-wider text-text-secondary hover:text-white transition-colors duration-300 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        Prev Page
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(activeLetter.pages!.length - 1, prev + 1))}
                        disabled={currentPage === activeLetter.pages.length - 1}
                        className="text-xs uppercase tracking-wider text-pink-glow hover:text-white transition-colors duration-300 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        Next Page
                      </button>
                    </div>
                  )}
                </div>
                <span className="font-serif text-xs text-text-secondary italic">
                  Page {currentPage + 1} of {activeLetter.pages ? activeLetter.pages.length : 1}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subtle Scroll Down Prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.55 }}
        viewport={{ once: true }}
        animate={{ y: [0, 5, 0] }}
        transition={{ 
          opacity: { duration: 0.5 },
          y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute bottom-14 left-0 right-0 mx-auto w-max z-30 flex flex-col items-center gap-1.5 pointer-events-none select-none"
      >
        <span className="font-sans text-[9px] tracking-[0.25em] text-white uppercase font-bold">
          Scroll Down
        </span>
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
