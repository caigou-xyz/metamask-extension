import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTokenNetworkFilter } from '../../../../../store/actions';
import {
  getCurrentChainId,
  getCurrentNetwork,
  getPreferences,
  getNetworkConfigurationsByChainId,
  getChainIdsToPoll,
  getShouldHideZeroBalanceTokens,
  getSelectedAccount,
} from '../../../../../selectors';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import { SelectableListItem } from '../sort-control/sort-control';
import { Text } from '../../../../component-library/text/text';
import {
  AlignItems,
  Display,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../../../helpers/constants/design-system';
import { Box } from '../../../../component-library/box/box';
import {
  AvatarNetwork,
  AvatarNetworkSize,
} from '../../../../component-library';
import UserPreferencedCurrencyDisplay from '../../../user-preferenced-currency-display';
import {
  CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP,
  TEST_CHAINS,
} from '../../../../../../shared/constants/network';
import { useGetFormattedTokensPerChain } from '../../../../../hooks/useGetFormattedTokensPerChain';
import { useAccountTotalCrossChainFiatBalance } from '../../../../../hooks/useAccountTotalCrossChainFiatBalance';

type SortControlProps = {
  handleClose: () => void;
};

const NetworkFilter = ({ handleClose }: SortControlProps) => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const chainId = useSelector(getCurrentChainId);
  const currentNetwork = useSelector(getCurrentNetwork);
  const selectedAccount = useSelector(getSelectedAccount);
  const allNetworks = useSelector(getNetworkConfigurationsByChainId);
  // const isTestnet = useSelector(getIsTestnet);
  const { tokenNetworkFilter, showNativeTokenAsMainBalance } =
    useSelector(getPreferences);

  const [chainsToShow, setChainsToShow] = useState<string[]>([]);

  const shouldHideZeroBalanceTokens = useSelector(
    getShouldHideZeroBalanceTokens,
  );
  const allChainIDs = useSelector(getChainIdsToPoll);
  const { formattedTokensWithBalancesPerChain } = useGetFormattedTokensPerChain(
    selectedAccount,
    shouldHideZeroBalanceTokens,
    true, // true to get formattedTokensWithBalancesPerChain for the current chain
    allChainIDs,
  );
  const { totalFiatBalance: selectedAccountBalance } =
    useAccountTotalCrossChainFiatBalance(
      selectedAccount,
      formattedTokensWithBalancesPerChain,
    );

  const { formattedTokensWithBalancesPerChain: formattedTokensForAllNetworks } =
    useGetFormattedTokensPerChain(
      selectedAccount,
      shouldHideZeroBalanceTokens,
      false, // false to get the value for all networks
      allChainIDs,
    );
  const { totalFiatBalance: selectedAccountBalanceForAllNetworks } =
    useAccountTotalCrossChainFiatBalance(
      selectedAccount,
      formattedTokensForAllNetworks,
    );

  const handleFilter = (chainFilters: Record<string, boolean>) => {
    dispatch(setTokenNetworkFilter(chainFilters));

    // TODO Add metrics
    handleClose();
  };

  useEffect(() => {
    const testnetChains: string[] = TEST_CHAINS;
    const mainnetChainIds = Object.keys(allNetworks).filter(
      (chain) => !testnetChains.includes(chain),
    );
    setChainsToShow(mainnetChainIds);
  }, []);

  const allOpts: Record<string, boolean> = {};
  Object.keys(allNetworks).forEach((chain) => {
    allOpts[chain] = true;
  });

  const currenNetworkFilterShown =
    Object.keys(tokenNetworkFilter ?? {}).length === 1;

  return (
    <>
      <SelectableListItem
        isSelected={!currenNetworkFilterShown}
        onClick={() => handleFilter(allOpts)}
      >
        <Box
          display={Display.Flex}
          justifyContent={JustifyContent.spaceBetween}
        >
          <Box>
            <Text
              variant={TextVariant.bodyMdMedium}
              color={TextColor.textDefault}
            >
              {t('allNetworks')}
            </Text>
            <Text
              variant={TextVariant.bodySmMedium}
              color={TextColor.textAlternative}
            >
              {/* TODO: Should query cross chain account balance */}

              <UserPreferencedCurrencyDisplay
                value={selectedAccountBalanceForAllNetworks}
                type="PRIMARY"
                ethNumberOfDecimals={4}
                hideTitle
                showFiat
                isAggregatedFiatOverviewBalance
              />
            </Text>
          </Box>
          <Box display={Display.Flex} alignItems={AlignItems.center}>
            {chainsToShow
              .slice(0, 5) // only show a max of 5 icons overlapping
              .map((chain, index) => {
                const networkImageUrl =
                  CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP[
                    chain as keyof typeof CHAIN_ID_TO_NETWORK_IMAGE_URL_MAP
                  ];
                return (
                  <AvatarNetwork
                    key={chainId}
                    name="All"
                    src={networkImageUrl ?? undefined}
                    size={AvatarNetworkSize.Sm}
                    // overlap the icons
                    style={{
                      marginLeft: index === 0 ? 0 : '-20px',
                      zIndex: 5 - index,
                    }}
                  />
                );
              })}
          </Box>
        </Box>
      </SelectableListItem>
      <SelectableListItem
        isSelected={currenNetworkFilterShown}
        onClick={() => handleFilter({ [chainId]: true })}
      >
        <Box
          display={Display.Flex}
          justifyContent={JustifyContent.spaceBetween}
          alignItems={AlignItems.center}
        >
          <Box>
            <Text
              variant={TextVariant.bodyMdMedium}
              color={TextColor.textDefault}
            >
              {t('currentNetwork')}
            </Text>
            <Text
              variant={TextVariant.bodySmMedium}
              color={TextColor.textAlternative}
            >
              <UserPreferencedCurrencyDisplay
                value={selectedAccountBalance}
                type="PRIMARY"
                ethNumberOfDecimals={4}
                hideTitle
                showFiat
                isAggregatedFiatOverviewBalance
              />
            </Text>
          </Box>
          <AvatarNetwork
            name="Current"
            src={currentNetwork?.rpcPrefs?.imageUrl}
          />
        </Box>
      </SelectableListItem>
    </>
  );
};

export default NetworkFilter;
