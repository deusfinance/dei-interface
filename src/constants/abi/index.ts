import OxDAO_HOLDER_ABI from 'constants/abi/OxDAO_HOLDER.json'
import SOLIDEX_HOLDER_ABI from 'constants/abi/SOLIDEX_HOLDER.json'
import GENERAL_LENDER_V1_ABI from 'constants/abi/GENERAL_LENDER_V1.json'
import GENERAL_LENDER_V2_ABI from 'constants/abi/GENERAL_LENDER_V2.json'
import GENERAL_LENDER_V3_ABI from 'constants/abi/GENERAL_LENDER_V3.json'

import { CollateralType, LenderVersion } from 'state/borrow/reducer'

export const HolderABI = {
  [CollateralType.SOLIDEX]: SOLIDEX_HOLDER_ABI,
  [CollateralType.OXDAO]: OxDAO_HOLDER_ABI,
}

export const LenderABI = {
  [LenderVersion.V1]: GENERAL_LENDER_V1_ABI,
  [LenderVersion.V2]: GENERAL_LENDER_V2_ABI,
  [LenderVersion.V3]: GENERAL_LENDER_V3_ABI,
}
