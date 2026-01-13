// import AccountModal from "@/components/modals/AccountModal"
import {BtnModalAsset, BtnModalContact} from "@/components/model/sc-modal"
// import RepairModal from "@/components/modals/RepairModal"

export default function ModalProvider({ 
  activeModal, 
  setActiveModal,
  selectedContactForCase,
 }) {
  const closeModal = () => setActiveModal(null)
  console.log("Check for modal provide data",selectedContactForCase)
  return (
    <>
      {/* <AccountModal open={activeModal === "account"} onOpenChange={(open) => setActiveModal(open ? "account" : null)} /> */}
      {/* <BtnModalAsset open={activeModal === "contact"} onOpenChange={(open) => setActiveModal(open ? "contact" : null)} />
      <BtnModalContact open={activeModal === "asset"} onOpenChange={(open) => setActiveModal(open ? "asset" : null)} /> */}
       <BtnModalAsset open={activeModal === "asset" } onOpenChange={closeModal} />
       <BtnModalContact open={activeModal === "contact"} onOpenChange={closeModal} />
      {/* <RepairModal open={activeModal === "repair"} onOpenChange={(open) => setActiveModal(open ? "repair" : null)} /> */}
    </>
  )
}
