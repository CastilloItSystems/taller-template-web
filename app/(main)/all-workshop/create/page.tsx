"use client";
import RefineriaForm from "@/components/refineriaComponents/RefineriaForm";
import { Page } from "../../../../types/layout";
import WorkshopForm from "@/components/workshop/WorkshopForm";

const workshop: Page = () => {
  return (
    <WorkshopForm
      workshop={null}
      hideWorkshopFormDialog={() => {}}
      workshops={[]}
      setWorkshops={() => {}}
    />
  );
};

export default workshop;
