import ContactHero from "./_components/ContactHero"
import ContactInfo from "./_components/ContactInfo"

export const metadata = {
  title: "تماس با ما | دادلاین",
  description:
    "با تیم پشتیبانی دادلاین در تماس باشید — ثبت تیکت، ایمیل، تلفن و آدرس دفتر",
}

const ContactPage = () => (
  <>
    <ContactHero />
    <ContactInfo />
  </>
)

export default ContactPage
