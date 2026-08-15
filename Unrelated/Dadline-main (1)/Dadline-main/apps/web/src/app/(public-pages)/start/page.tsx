import StartHero from "./_components/StartHero"
import StartFeatures from "./_components/StartFeatures"
import StartRequirements from "./_components/StartRequirements"
import StartTestimonials from "./_components/StartTestimonials"
import StartFAQ from "./_components/StartFAQ"
import StartCTA from "./_components/StartCTA"
import DadlineFooter from "../_components/DadlineFooter"

export const metadata = {
  title: "همکاری با دادلاین | پلتفرم خدمات حقوقی ویژه وکلا و متخصصان",
  description:
    "دادلاین، زیرساخت هوشمند ارائه خدمات حقوقی برای وکلا، قضات، کارشناسان و متخصصان حقوقی. ثبت‌نام رایگان و شروع درآمدزایی.",
}

const StartPage = () => (
  <>
    <StartHero />
    <StartFeatures />
    <StartRequirements />
    <StartTestimonials />
    <StartFAQ />
    <StartCTA />
  </>
)

export default StartPage
