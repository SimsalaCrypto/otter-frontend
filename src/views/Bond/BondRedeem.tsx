import { Box, Slide } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BondKey, getBond } from 'src/constants';
import { prettifySeconds, prettyVestingPeriod, trim } from '../../helpers';
import { useWeb3Context } from '../../hooks';
import { redeemBond } from '../../store/slices/bond-slice';
import { IPendingTxn, isPendingTxn, txnButtonText } from '../../store/slices/pending-txns-slice';
import { IReduxState } from '../../store/slices/state.interface';
import { useTranslation, Trans } from 'react-i18next';
import BondRedeemDialog from './BondRedeemDialog';
import ActionButton from '../../components/Button/ActionButton';

interface IBondRedeem {
  bondKey: BondKey;
}

function BondRedeem({ bondKey }: IBondRedeem) {
  const dispatch = useDispatch();
  const { provider, address, chainID } = useWeb3Context();
  const bond = getBond(bondKey, chainID);
  const [open, setOpen] = useState(false);

  const currentBlockTime = useSelector<IReduxState, number>(state => state.app.currentBlockTime);
  const isBondLoading = useSelector<IReduxState, boolean>(state => state.bonding.loading ?? true);
  const bondMaturationTime = useSelector<IReduxState, number>(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].bondMaturationTime;
  });
  const vestingTerm = useSelector<IReduxState, number>(state => state.bonding[bondKey]?.vestingTerm);
  const interestDue = useSelector<IReduxState, number>(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].interestDue;
  });
  const sClamBalance = useSelector<IReduxState, string>(state => {
    //@ts-ignore
    return state.account.balances && state.account.balances.sClam;
  });
  const pendingPayout = useSelector<IReduxState, number>(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].pendingPayout;
  });
  const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => state.pendingTransactions);

  const onRedeem = async (autostake: boolean) => {
    let redeemTx: any = await dispatch(redeemBond({ address, bondKey, networkID: chainID, provider, autostake }));
    if (redeemTx.payload == true) {
      handleOpenDialog();
    }
  };

  const vestingTime = () => {
    return prettyVestingPeriod(currentBlockTime, bondMaturationTime);
  };

  const fullVested = currentBlockTime > bondMaturationTime;

  const vestingPeriod = () => {
    return prettifySeconds(vestingTerm, 'day');
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const bondDiscount = useSelector<IReduxState, number>(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondDiscount;
  });

  const debtRatio = useSelector<IReduxState, number>(
    state => state.bonding[bondKey] && state.bonding[bondKey].debtRatio,
  );

  const { t } = useTranslation();
  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="space-around" flexWrap="wrap">
        {bond.autostake && !fullVested && (
          <Box
            className="transaction-button app-otter-button"
            bgcolor="otter.otterBlue"
            color="otter.white"
            onClick={() => {
              if (bond.autostake && !fullVested) {
                window.alert(t('bonds.redeem.fullyVestedPopup'));
                return;
              }
            }}
          >
            <p>{t('common.claim')}</p>
          </Box>
        )}
        {!(bond.autostake && !fullVested) && (
          <ActionButton
            pendingTransactions={pendingTransactions}
            type={'redeem_bond_' + bondKey}
            start="Claim"
            progress="Claiming..."
            processTx={() => onRedeem(false)}
          ></ActionButton>
        )}
        {!bond.deprecated && !bond.autostake && (
          <ActionButton
            pendingTransactions={pendingTransactions}
            type={'redeem_bond_' + bondKey + '_autostake'}
            start="Claim and Autostake"
            progress="Claiming..."
            processTx={() => onRedeem(true)}
          ></ActionButton>
        )}
      </Box>
      <BondRedeemDialog
        open={open}
        handleClose={handleCloseDialog}
        pendingPayout={trim(pendingPayout, 4)}
        balance={trim(sClamBalance, 4)}
      />
      <Slide direction="right" in={true} mountOnEnter unmountOnExit {...{ timeout: 533 }}>
        <Box className="bond-data">
          <div className="data-row">
            <p className="bond-balance-title">{t('bonds.redeem.pendingRewards')}</p>
            <p className="price-data bond-balance-value">
              {isBondLoading ? (
                <Skeleton width="100px" />
              ) : bond.autostake ? (
                `${trim(interestDue, 4)} sCLAM`
              ) : (
                `${trim(interestDue, 4)} CLAM`
              )}
            </p>
          </div>
          {!bond.autostake && (
            <div className="data-row">
              <p className="bond-balance-title">{t('bonds.redeem.claimableRewards')}</p>
              <p className="price-data bond-balance-value">
                {isBondLoading ? <Skeleton width="100px" /> : `${trim(pendingPayout, 4)} CLAM`}
              </p>
            </div>
          )}
          <div className="data-row">
            <p className="bond-balance-title">{t('bonds.redeem.timeUntilFullyVested')}</p>
            <p className="price-data bond-balance-value">
              {isBondLoading ? <Skeleton width="100px" /> : vestingTime()}
            </p>
          </div>

          {!bond.deprecated && (
            <div className="data-row">
              <p className="bond-balance-title">{t('common.roi')}</p>
              <p className="bond-balance-value">
                {isBondLoading ? <Skeleton width="100px" /> : `${trim(bondDiscount * 100, 2)}%`}
              </p>
            </div>
          )}

          <div className="data-row">
            <p className="bond-balance-title">{t('bonds.debtRatio')}</p>
            <p className="bond-balance-value">
              {isBondLoading ? <Skeleton width="100px" /> : `${trim(debtRatio / 10000000, 2)}%`}
            </p>
          </div>

          <div className="data-row">
            <p className="bond-balance-title">{t('bonds.vestingTerm')}</p>
            <p className="bond-balance-value">{isBondLoading ? <Skeleton width="100px" /> : vestingPeriod()}</p>
          </div>
        </Box>
      </Slide>
    </Box>
  );
}

export default BondRedeem;
