import ContractsHero from "./_components/ContractsHero"
import ContractsSteps from "./_components/ContractsSteps"
import ContractsAI from "./_components/ContractsAI"
import ContractsFAQ from "./_components/ContractsFAQ"

export const metadata = {
  title: "قرارداد آنلاین | دادلاین",
  description:
    "تنظیم قرارداد آنلاین، امضای دیجیتال قانونی و بررسی قرارداد با هوش مصنوعی — آنلاین، امن و قانونی با دادلاین",
}

const ContractsPage = () => (
  <>
    <ContractsHero />
    <ContractsSteps />
    <ContractsAI />
    <ContractsFAQ />
  </>
)

export default ContractsPage
