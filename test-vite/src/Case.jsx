import React, { useEffect, useState } from 'react'
import { ServiceCase } from './components/service-case'
import { useParams } from 'react-router'

import ApiCustomer from './api'

export const Case = () => {
  const { caseId } = useParams(); // 🔥 Get caseId from URL
  const [caseDetails, setCaseDetails] = useState(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await ApiCustomer.get(`/api/case-information/${caseId}`);
        setCaseDetails(response.data.data);
      } catch (error) {
        console.error("Error fetching case details:", error);
      }
    };

    fetchCaseDetails();
  }, [caseId]);

  if (!caseDetails) return <p>Loading case details...</p>;

  return (
    <ServiceCase 
      caseDetails={caseDetails}
    ></ServiceCase>
  )
}