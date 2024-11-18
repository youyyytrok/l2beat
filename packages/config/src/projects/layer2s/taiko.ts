import {
  assert,
  EthereumAddress,
  ProjectId,
  UnixTime,
  formatSeconds,
} from '@l2beat/shared-pure'
import { utils } from 'ethers'
import {
  CONTRACTS,
  DATA_ON_CHAIN,
  DA_BRIDGES,
  DA_LAYERS,
  DA_MODES,
  RISK_VIEW,
  addSentimentToDataAvailability,
} from '../../common'
import { ProjectDiscovery } from '../../discovery/ProjectDiscovery'
import { Badge } from '../badges'
import { getStage } from './common/stages/getStage'
import { Layer2 } from './types'

const discovery = new ProjectDiscovery('taiko')

const upgradesTaikoMultisig = {
  upgradableBy: ['TaikoAdmin'],
  upgradeDelay: 'No delay',
}

const chainWatchdog = discovery.getContractValue<string>(
  'TaikoL1Contract',
  'chain_watchdog',
)

// sequencer for block 1
const proposerOne = discovery.getContractValue<string>(
  'TaikoL1Contract',
  'proposer_one',
)

const TaikoL1ContractAddress = discovery.getContract('TaikoL1Contract').address

const TIER_SGX = discovery.getContractValue<{
  verifierName: string
  validityBond: number
  contestBond: number
  cooldownWindow: number
  provingWindow: number
  maxBlocksToVerifyPerProof: number
}>('MainnetTierRouter', 'TIER_SGX')

const TIER_RISC0 = discovery.getContractValue<{
  verifierName: string
  validityBond: number
  contestBond: number
  cooldownWindow: number
  provingWindow: number
  maxBlocksToVerifyPerProof: number
}>('MainnetTierRouter', 'TIER_RISC0')

const TIER_SP1 = discovery.getContractValue<{
  verifierName: string
  validityBond: number
  contestBond: number
  cooldownWindow: number
  provingWindow: number
  maxBlocksToVerifyPerProof: number
}>('MainnetTierRouter', 'TIER_SP1')

const TIER_MINORITY_GUARDIAN = discovery.getContractValue<{
  verifierName: string
  validityBond: number
  contestBond: number
  cooldownWindow: number
  provingWindow: number
  maxBlocksToVerifyPerProof: number
}>('MainnetTierRouter', 'TIER_GUARDIAN_MINORITY')

const GuardianMinorityProverMinSigners = discovery.getContractValue<string[]>(
  'GuardianMinorityProver',
  'minGuardians',
)
const NumGuardiansMinorityProver = discovery.getContractValue<string[]>(
  'GuardianMinorityProver',
  'numGuardians',
)

const GuardianProverMinSigners = discovery.getContractValue<string[]>(
  'GuardianProver',
  'minGuardians',
)
const NumGuardiansProver = discovery.getContractValue<string[]>(
  'GuardianProver',
  'numGuardians',
)

const TaikoChainConfig = discovery.getContractValue<{
  [key: string]: number | string
}>('TaikoL1Contract', 'getConfig')

const SGXcooldownWindow = formatSeconds(Number(TIER_SGX.cooldownWindow) * 60) // value in minutes
const SGXprovingWindow = formatSeconds(Number(TIER_SGX.provingWindow) * 60) // value in minutes
const SGXvalidityBond = utils.formatEther(TIER_SGX.validityBond) // value in TAIKO
const SGXcontestBond = utils.formatEther(TIER_SGX.contestBond) // value in TAIKO
const RISC0cooldownWindow = formatSeconds(TIER_RISC0.cooldownWindow * 60) // value in minutes
const RISC0provingWindow = formatSeconds(TIER_RISC0.provingWindow * 60) // value in minutes
const RISC0validityBond = utils.formatEther(TIER_RISC0.validityBond) // value in TAIKO
const RISC0contestBond = utils.formatEther(TIER_RISC0.contestBond) // value in TAIKO
const SP1cooldownWindow = formatSeconds(TIER_SP1.cooldownWindow * 60) // value in minutes
const SP1provingWindow = formatSeconds(TIER_SP1.provingWindow * 60) // value in minutes
const SP1validityBond = utils.formatEther(TIER_SP1.validityBond) // value in TAIKO
const SP1contestBond = utils.formatEther(TIER_SP1.contestBond) // value in TAIKO
const MinorityValidityBond = utils.formatEther(
  TIER_MINORITY_GUARDIAN.validityBond,
) // value in TAIKO
const MinorityContestBond = utils.formatEther(
  TIER_MINORITY_GUARDIAN.contestBond,
) // value in TAIKO

assert(
  RISC0cooldownWindow === SP1cooldownWindow &&
    RISC0provingWindow === SP1provingWindow &&
    RISC0validityBond === SP1validityBond &&
    RISC0contestBond === SP1contestBond &&
    SGXcooldownWindow === RISC0cooldownWindow,
  'The tier config assumptions have changed, plz review the technology section and riskView.stateValidation.',
)

const LivenessBond = utils.formatEther(TaikoChainConfig.livenessBond)

export const taiko: Layer2 = {
  id: ProjectId('taiko'),
  createdAt: new UnixTime(1680768480), // 2023-04-06T08:08:00Z
  dataAvailability: [
    addSentimentToDataAvailability({
      layers: [DA_LAYERS.ETH_BLOBS_OR_CALLLDATA],
      bridge: DA_BRIDGES.ENSHRINED,
      mode: DA_MODES.TRANSACTION_DATA,
    }),
  ],
  badges: [Badge.VM.EVM, Badge.DA.EthereumBlobs, Badge.Other.BasedSequencing],
  display: {
    name: 'Taiko',
    slug: 'taiko',
    provider: 'Taiko',
    description:
      'Taiko is an Ethereum-equivalent Optimistic Rollup on the Ethereum network. In the future it aims to add zkVerifier making it a hybrid, optimistic-zk construction. Taiko combines based sequencing and a contestation mechanism with multi-proofs.',
    purposes: ['Universal'],
    category: 'Optimistic Rollup',
    links: {
      websites: ['https://taiko.xyz'],
      apps: ['https://bridge.taiko.xyz/'],
      documentation: ['https://docs.taiko.xyz/'],
      explorers: ['https://taikoscan.io', 'https://taikoscan.network/'],
      repositories: ['https://github.com/taikoxyz'],
      socialMedia: [
        'https://twitter.com/taikoxyz',
        'https://discord.gg/taikoxyz',
        'https://taiko.mirror.xyz',
      ],
      rollupCodes: 'https://rollup.codes/taiko',
    },
    activityDataSource: 'Blockchain RPC',
    liveness: {
      explanation:
        'Taiko is an Optimistic rollup that posts blocks of L2 transaction data directly to the L1. For a transaction to be considered final, both a block and its parent block have to be proven on the L1. State updates are a three step process: first blocks are proposed to L1, then they are proved, and lastly finalized after the challenge period has elapsed.',
    },
  },
  config: {
    associatedTokens: ['TAIKO'],
    escrows: [
      {
        // Shared ETH bridge
        address: EthereumAddress('0xd60247c6848B7Ca29eDdF63AA924E53dB6Ddd8EC'),
        sinceTimestamp: new UnixTime(1714550603),
        tokens: ['ETH'],
        chain: 'ethereum',
      },
      {
        // Shared ERC20 vault
        address: EthereumAddress('0x996282cA11E5DEb6B5D122CC3B9A1FcAAD4415Ab'),
        sinceTimestamp: new UnixTime(1714550603),
        tokens: '*',
        chain: 'ethereum',
      },
    ],
    transactionApi: {
      type: 'rpc',
      defaultUrl: 'https://rpc.mainnet.taiko.xyz',
      defaultCallsPerMinute: 500,
      startBlock: 1,
    },
    trackedTxs: [
      {
        uses: [
          { type: 'liveness', subtype: 'batchSubmissions' },
          { type: 'l2costs', subtype: 'batchSubmissions' },
        ],
        query: {
          formula: 'functionCall',
          address: TaikoL1ContractAddress,
          selector: '0xef16e845',
          functionSignature:
            'function proposeBlock(bytes _params, bytes _txList) payable returns (tuple(bytes32 l1Hash, bytes32 difficulty, bytes32 blobHash, bytes32 extraData, bytes32 depositsHash, address coinbase, uint64 id, uint32 gasLimit, uint64 timestamp, uint64 l1Height, uint16 minTier, bool blobUsed, bytes32 parentMetaHash, address sender) meta_, tuple(address recipient, uint96 amount, uint64 id)[] deposits_)',
          sinceTimestamp: new UnixTime(1716620627),
        },
      },
      {
        uses: [
          { type: 'liveness', subtype: 'batchSubmissions' },
          { type: 'l2costs', subtype: 'batchSubmissions' },
        ],
        query: {
          formula: 'functionCall',
          address: TaikoL1ContractAddress,
          selector: '0x648885fb',
          functionSignature:
            'function proposeBlockV2(bytes _params, bytes _txList) returns (tuple meta_)',
          sinceTimestamp: new UnixTime(1730602883),
        },
      },
      {
        uses: [
          { type: 'liveness', subtype: 'batchSubmissions' },
          { type: 'l2costs', subtype: 'batchSubmissions' },
        ],
        query: {
          formula: 'functionCall',
          address: TaikoL1ContractAddress,
          selector: '0x0c8f4a10',
          functionSignature:
            'function proposeBlocksV2(bytes[] _paramsArr, bytes[] _txListArr) returns (tuple[] metaArr_)',
          sinceTimestamp: new UnixTime(1730602883),
        },
      },
      {
        uses: [
          { type: 'liveness', subtype: 'stateUpdates' },
          { type: 'l2costs', subtype: 'stateUpdates' },
        ],
        query: {
          formula: 'functionCall',
          address: TaikoL1ContractAddress,
          selector: '0x10d008bd',
          functionSignature:
            'function proveBlock(uint64 _blockId, bytes _input)',
          sinceTimestamp: new UnixTime(1716620627),
        },
      },
      {
        uses: [
          { type: 'liveness', subtype: 'stateUpdates' },
          { type: 'l2costs', subtype: 'stateUpdates' },
        ],
        query: {
          formula: 'functionCall',
          address: TaikoL1ContractAddress,
          selector: '0x440b6e18',
          functionSignature:
            'function proveBlocks(uint64[] _blockIds, bytes[] _inputs, bytes _batchProof)',
          sinceTimestamp: new UnixTime(1730602883),
        },
      },
    ],
  },
  chainConfig: {
    name: 'taiko',
    chainId: 167000,
    explorerUrl: 'https://taikoscan.io',
    explorerApi: {
      url: 'https://api.taikoscan.io/api',
      type: 'etherscan',
    },
    minTimestampForTvl: new UnixTime(1716620627),
  },
  type: 'layer2',
  riskView: {
    stateValidation: {
      description: `A multi-tier proof system is used. The tiers are SGX, ZK (RISC0, SP1), Minority Guardian, and Guardian (highest tier). A higher tier proof can challenge a lower one within the challenge period.
        The system allows for an invalid state to be finalized by compromised Guardians (the highest tier) and does not enforce ZK proofs.`,
      sentiment: 'bad',
      value: 'Multi-proofs',
      secondLine: `${SGXcooldownWindow} challenge period`,
    },
    dataAvailability: {
      ...DATA_ON_CHAIN,
    },
    exitWindow: {
      description:
        'There is no window for users to exit in case of an unwanted upgrade since contracts are instantly upgradable.',
      sentiment: 'bad',
      value: 'None',
    },
    sequencerFailure: {
      description:
        'The system uses a based (or L1-sequenced) rollup sequencing mechanism. Users can propose L2 blocks directly on the Taiko L1 contract. The TaikoAdmin multisig can pause block proposals without delay.',
      sentiment: 'good',
      value: 'Self sequence', // based rollup sequencing
    },
    proposerFailure: {
      description:
        'Provers can examine the proposed blocks on the TaikoL1 contract, and generate SGX proofs for them. Currently, any prover providing a valid SGX attestation can register a SGX instance and create proofs for proposed blocks.',
      sentiment: 'good',
      value: 'Self propose',
    },
    validatedBy: RISK_VIEW.VALIDATED_BY_ETHEREUM,
    destinationToken: RISK_VIEW.NATIVE_AND_CANONICAL(),
  },
  stage: getStage(
    {
      stage0: {
        callsItselfRollup: true,
        stateRootsPostedToL1: true,
        dataAvailabilityOnL1: true,
        rollupNodeSourceAvailable: true,
      },
      stage1: {
        stateVerificationOnL1: false,
        fraudProofSystemAtLeast5Outsiders: null,
        usersHave7DaysToExit: false,
        usersCanExitWithoutCooperation: false,
        securityCouncilProperlySetUp: false,
      },
      stage2: {
        proofSystemOverriddenOnlyInCaseOfABug: false,
        fraudProofSystemIsPermissionless: null,
        delayWith30DExitWindow: false,
      },
    },
    {
      rollupNodeLink: 'https://github.com/taikoxyz/simple-taiko-node',
    },
  ),
  technology: {
    stateCorrectness: {
      name: 'Multi-tier proof system',
      description: `Taiko uses a multi-tier proof system to validate state transitions. There are five tiers: The SGX tier, two ZK tiers with RISC0 and SP1 verifiers, the ${GuardianMinorityProverMinSigners}/${NumGuardiansMinorityProver} Guardian tier and the ${GuardianProverMinSigners}/${NumGuardiansProver} Guardian tier (from lowest to highest).
      Since the Guardian tiers are the highest, validity proofs can generally be overwritten by a single Guardian. Consequently, there is no way to force the RISC0 or SP1 tiers.
      
      When proposing a batch (containing one or multiple L2 blocks), the proposer is assigned the designated prover role for that batch and is required to deposit a liveness bond (${LivenessBond} TAIKO) as a commitment to prove the batch, which will be returned once the batch is proven.
      The default (lowest) SGX tier has a proving window of ${SGXprovingWindow}, during which only the designated prover can submit the proof for the batch. Once elapsed, proving is open to everyone able to submit SGX proofs and a *validity bond*. The two ZK tiers have a proving window of ${RISC0provingWindow}.
      
      After the proof is submitted and during its ${SGXcooldownWindow} *cooldown window*, anyone can contest the batch by submitting a *contest bond*. Provers have to submit a *validity bond* as a commitment to win a potential contest.
      A *validity bond* is TAIKO ${SGXvalidityBond} for SGX vs ${RISC0validityBond} for ZK tiers, while a *contest bond* is TAIKO ${SGXcontestBond} for SGX vs. ${RISC0contestBond} for the two ZK tiers. 
      For the Minority guardian tier, *validity* and *contest bonds* are set to ${MinorityValidityBond} TAIKO and ${MinorityContestBond} TAIKO, respectively.
      
      It is not required to provide a proof for the batch to submit a contestation. When someone contests, a higher level tier has to step in to prove the contested batch. Decision of the highest tier (currently the ${GuardianProverMinSigners}/${NumGuardiansProver} Guardian) is considered final.
      If no one challenges the original SGX proof, it finalizes after ${SGXcooldownWindow} (the cooldown window).`,
      references: [
        {
          text: 'MainnetTierRouter.sol - Etherscan source code, tier ids',
          href: 'https://etherscan.io/address/0x394E30d83d020469a1F8b16E89D7fD5FdB1935b0#code#F1#L26',
        },
        {
          text: 'TaikoL1.sol - Etherscan source code, liveness bond',
          href: 'https://etherscan.io/address/0xe7c4B445D3C7C8E4D68afb85A068F9fAa18e9A5B#code',
        },
      ],
      risks: [
        {
          category: 'Funds can be stolen if',
          text: 'a malicious block is proven by a compromised SGX instance or approved by Guardians.',
        },
      ],
    },
    dataAvailability: {
      name: 'All data required for proofs is published on chain',
      description:
        'All the data that is used to construct the system state is published on chain in the form of blobs. This ensures that it will be available for enough time.',
      references: [],
      risks: [],
    },
    operator: {
      name: 'The system uses a based sequencing mechanism',
      description: `The system uses a based (or L1-sequenced) sequencing mechanism. Anyone can sequence Taiko L2 blocks by proposing them directly on the TaikoL1 contract. 
        The proposer of a block is assigned the designated prover role, and will be the only entity allowed to provide a proof for the block during the initial proving window. 
        Currently, proving a block requires the block proposer to run an SGX instance. Proposing a block also requires depositing a liveness bond as a commitment to proving the block. 
        Unless the block proposer proves the block within the proving window, it will forfeit its liveness bond to the TaikoL1 smart contract.`,
      references: [
        {
          text: 'TaikoL1.sol - Etherscan source code, proposeBlock function',
          href: 'https://etherscan.io/address/0xe7c4B445D3C7C8E4D68afb85A068F9fAa18e9A5B#code',
        },
      ],
      risks: [],
    },
    forceTransactions: {
      name: `Users can force any transaction`,
      description: `The system is designed to allow users to propose L2 blocks directly on L1. 
        Note that this would require the user to run an SGX instance to prove the block, or forfeit the liveness bond of ${LivenessBond} TAIKO.
        The TaikoAdmin multisig can pause block proposals without delay.`,
      references: [],
      risks: [],
    },
    exitMechanisms: [
      // to do: double check exit mechanism
      {
        name: 'Regular exit',
        description: `The user initiates the withdrawal by submitting a regular transaction on this chain. When the block containing that transaction is finalized the funds become available for withdrawal on L1. Finally the user submits an L1 transaction to claim the funds. This transaction requires a merkle proof.`,
        risks: [],
        references: [],
      },
    ],
  },
  contracts: {
    addresses: [
      discovery.getContractDetails('TaikoL1Contract', {
        description:
          'This contract provides functionalities for sequencing, proving, and verifying batches.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('L1RollupAddressManager', {
        description:
          'This contract manages the rollup addresses list, allowing to set the address for a specific chainId-name pair.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('MainnetTierRouter', {
        description:
          'Contract managing and routing the multi-tier proof system.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('SgxVerifier', {
        description: 'Verifier contract for SGX proven batches.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('Risc0Verifier', {
        description: 'Verifier contract for ZK-proven batches.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('SP1Verifier', {
        description: 'Verifier contract for ZK-proven batches.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('GuardianMinorityProver', {
        description:
          'Verifier contract for batches proven by Guardian multisig minority.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('GuardianProver', {
        description: 'Verifier contract for Guardian multisig proven batches.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('DAOFallbackProposer', {
        description:
          "A contract that holds TAIKO token and acts as a Taiko Labs owned proposer and prover proxy. This contract relays `proveBlock` calls to the TaikoL1 contract so that msg.sender doesn't need to hold any TKO. There are several instances of this contract operated by different entities.",
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('SignalService', {
        description:
          'The SignalService contract serves as cross-chain message passing system. It defines methods for sending and verifying signals with merkle proofs.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('AutomataDcapV3Attestation', {
        description: 'Contract managing SGX attestation certificates.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('TaikoToken', {
        description:
          "Taiko's native token. Used for block proposal rewards, proving bonds and rewards, and contesting bonds.",
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('TaikoBridge', {
        description: 'Shared bridge for Taiko chains for bridged ETH.',
        ...upgradesTaikoMultisig,
      }),
      discovery.getContractDetails('SharedERC20Vault', {
        description: 'Shared vault for Taiko chains for bridged ERC20 tokens.',
        ...upgradesTaikoMultisig,
      }),
    ],
    risks: [CONTRACTS.UPGRADE_NO_DELAY_RISK],
  },
  permissions: [
    ...discovery.getMultisigPermission(
      'TaikoAdmin',
      'Currently also designated as the Security Council. Can upgrade proxies without delay, remove SGX attestation certificates, pause block proposals and block proving, among other permissions.',
    ),
    {
      name: 'GuardianProvers',
      description: `Guardians can prove blocks on the highest tier. Guardians are selected by the TaikoAdmin multisig. Acts as a ${GuardianProverMinSigners}/${NumGuardiansProver} multisig.`,
      accounts: discovery.getPermissionedAccounts(
        'GuardianProver',
        'guardians',
      ),
    },
    {
      name: 'GuardianMinorityProver',
      description: `Minority guardians can prove blocks on the second highest tier. Guardians are selected by the TaikoAdmin multisig. Acts as a ${GuardianMinorityProverMinSigners}/${NumGuardiansMinorityProver} multisig.`,
      accounts: discovery.getPermissionedAccounts(
        'GuardianMinorityProver',
        'guardians',
      ),
    },
    {
      name: 'ChainWatchdog',
      accounts: [{ address: EthereumAddress(chainWatchdog), type: 'MultiSig' }],
      description: 'The chain watchdog role can pause proving of blocks.',
    },
    {
      name: 'SequencerBlockOne',
      accounts: [{ address: EthereumAddress(proposerOne), type: 'EOA' }],
      description:
        'The authorized sequencer (in Taiko called “proposer”) of block one, hardcoded to vitalik.eth address.',
    },
  ],
  milestones: [
    {
      name: 'TKO Token Airdrop',
      link: 'https://taiko.mirror.xyz/VSOtILX2DQsc_6IMt5hBT1fEYSH8243pZ8IA_pBfHks',
      date: '2024-06-05T00:00:00.00Z',
      description: 'TKO token launches.',
      type: 'general',
    },
    {
      name: 'Taiko Mainnet Launch',
      link: 'https://taiko.mirror.xyz/Pizjv30FvjsZUwEG-Da7Gs6F8qeDLc4CKKEBqy3pTt8',
      date: '2024-05-27T00:00:00.00Z',
      description: 'Taiko is deployed on Ethereum mainnet.',
      type: 'general',
    },
    {
      name: 'Taiko Based Sequencing Upgrade',
      link: 'https://taiko.mirror.xyz/_oKlnpzKSOxGILyy4WlvpUmYEqD7BFxzmRo3XETlJqE',
      date: '2024-06-06T00:00:00.00Z',
      description: 'Proposing blocks on Taiko is now permissionless.',
      type: 'general',
    },
  ],
}
