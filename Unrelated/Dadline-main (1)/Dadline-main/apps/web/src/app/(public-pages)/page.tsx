import HeroSection from "./_components/HeroSection"
import JudicialLinksSection from "./_components/JudicialLinksSection"
import ServicesSection from "./_components/ServicesSection"

export const metadata = {
  title: "دادلاین - دستیار هوشمند حقوقی و مشاوره با وکیل پایه یک",
  description:
    "دادلاین سامانه خدمات حقوقی آنلاین با مشاوره تلفنی، ارزیابی پرونده، قرارداد الکترونیکی و دستیار هوش مصنوعی حقوقی",
}

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <JudicialLinksSection />
    </>
  )
}

export default HomePage
