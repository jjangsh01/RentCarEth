//src/components/KYCStatus.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import KYCManagerABI from "../abi/KYCManager.json";

const KYCStatus = ({ signer, account }) => {
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const check = async () => {
      if (!signer || !account) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const contract = new ethers.Contract(
          import.meta.env.VITE_CONTRACT_KYC,
          KYCManagerABI.abi,
          signer
        );

        // 직접 호출 방식으로 변경
        const callData = contract.interface.encodeFunctionData("checkKYC", [account]);
        
        // 로우 레벨 호출 사용
        const result = await signer.provider.call({
          to: import.meta.env.VITE_CONTRACT_KYC,
          data: callData
        });
        
        // 결과가 비어있는지 확인
        if (result === "0x") {
          console.log("컨트랙트가 빈 응답 반환, KYC 미인증으로 처리");
          setIsApproved(false);
        } else {
          // 결과 디코딩 시도
          try {
            const decodedResult = contract.interface.decodeFunctionResult("checkKYC", result);
            setIsApproved(decodedResult[0]);
            console.log("KYC 상태:", decodedResult[0]);
          } catch (decodeError) {
            console.error("결과 디코딩 실패:", decodeError);
            setIsApproved(false);
          }
        }
      } catch (error) {
        console.error("KYC 상태 확인 중 오류:", error);
        setError("KYC 상태를 확인할 수 없습니다");
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [signer, account]);

  if (loading) return <p>⏳ KYC 상태 확인 중...</p>;
  if (error) return <p>⚠️ {error}</p>;

  return (
    <div>
      <h2>KYC 인증 상태</h2>
      {isApproved ? (
        <p>✅ 인증됨 – 차량 대여 가능</p>
      ) : (
        <p>❌ 미인증 – 관리자 승인 필요</p>
      )}
    </div>
  );
};

export default KYCStatus;
