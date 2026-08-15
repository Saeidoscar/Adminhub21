import DadbotHero from "./_components/DadbotHero"
import DadbotServices from "./_components/DadbotServices"
import DadbotWhy from "./_components/DadbotWhy"
import DadbotFAQ from "./_components/DadbotFAQ"

export const metadata = {
  title: "دادبات — هوش مصنوعی حقوقی | دادلاین",
  description:
    "با دادبات، دستیار هوشمند حقوقی دادلاین، پاسخ سوالات حقوقی خود را فوری دریافت کنید. ۳۰۰۰ توکن رایگان برای شروع.",
}

const AIPage = () => (
  <>
    <DadbotHero />
    <DadbotServices />
    <DadbotWhy />
    <DadbotFAQ />
  </>
)

export default AIPage
