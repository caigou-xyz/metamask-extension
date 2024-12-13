import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import {
  BannerAlert,
  ButtonLink,
  Text,
  BannerAlertSeverity,
} from '../../../../components/component-library';
import { setAlertEnabledness } from '../../../../store/actions';
import { AlertTypes } from '../../../../../shared/constants/alerts';
import { SMART_TRANSACTIONS_LEARN_MORE_URL } from '../../../../../shared/constants/smartTransactions';
import { useConfirmContext } from '../../context/confirm';
import { useCallback } from 'react';

type MarginType = 'default' | 'none' | 'noTop' | 'onlyTop';

type SmartTransactionsBannerAlertProps = {
  marginType?: MarginType;
};

type MetaMaskState = {
  alertEnabledness: {
    [key: string]: boolean;
  };
  preferences: {
    smartTransactionsOptInStatus: boolean;
  };
};

type RootState = {
  metamask: MetaMaskState;
};

export const SmartTransactionsBannerAlert: React.FC<SmartTransactionsBannerAlertProps> =
  React.memo(({ marginType = 'default' }) => {
    const dispatch = useDispatch();
    const t = useI18nContext();

    // Check for ConfirmContext, default to rendering unconditionally if context is absent
    let currentConfirmation;
    try {
      const context = useConfirmContext();
      currentConfirmation = context?.currentConfirmation;
    } catch {
      currentConfirmation = null; // Not within ConfirmContextProvider
    }

    const alertEnabled = useSelector(
      (state: RootState) =>
        state.metamask.alertEnabledness?.[
          AlertTypes.smartTransactionsMigration
        ] !== false,
    );
    const smartTransactionsOptIn = useSelector(
      (state: RootState) =>
        state.metamask.preferences?.smartTransactionsOptInStatus === true,
    );

    React.useEffect(() => {
      if (alertEnabled && !smartTransactionsOptIn) {
        dispatch({
          type: 'alert/dismiss',
          payload: {
            alertId: AlertTypes.smartTransactionsMigration,
            enabled: false,
          },
        });
        setAlertEnabledness(AlertTypes.smartTransactionsMigration, false);
      }
    }, [alertEnabled, smartTransactionsOptIn, dispatch]);


    const handleDismiss = useCallback(() => {
      dispatch({
        type: 'alert/dismiss',
        payload: {
          alertId: AlertTypes.smartTransactionsMigration,
          enabled: false,
        },
      });
      setAlertEnabledness(AlertTypes.smartTransactionsMigration, false);
    }, [dispatch]);

    // // Check for mismatch immediately, not in an effect
    // if (alertEnabled && !smartTransactionsOptIn) {
    //   handleDismiss();
    // }

    // modify the shouldRender logic to handle no context differently:
    const shouldRender =
      currentConfirmation === null
        ? alertEnabled && smartTransactionsOptIn
        : alertEnabled &&
          smartTransactionsOptIn &&
          ['simpleSend', 'tokenMethodTransfer', 'swap', 'deployContract'].includes(
            currentConfirmation.type as string,
          );

    if (!shouldRender) {
      return null;
    }



    const getMarginStyle = () => {
      switch (marginType) {
        case 'none':
          return { margin: 0 };
        case 'noTop':
          return { marginTop: 0 };
        case 'onlyTop':
          return { margin: 0, marginTop: 16 };
        default:
          return undefined;
      }
    };

    return (
      <BannerAlert
        severity={BannerAlertSeverity.Info}
        onClose={handleDismiss}
        data-testid="smart-transactions-banner-alert"
        style={getMarginStyle()}
      >
        <Text as="p">
          {t('smartTransactionsEnabled')}
          <ButtonLink
            href={SMART_TRANSACTIONS_LEARN_MORE_URL}
            onClick={handleDismiss}
            externalLink
          >
            {t('learnMore')}
          </ButtonLink>
        </Text>
      </BannerAlert>
    );
  });

SmartTransactionsBannerAlert.displayName = 'SmartTransactionsBannerAlert';

export default SmartTransactionsBannerAlert;
