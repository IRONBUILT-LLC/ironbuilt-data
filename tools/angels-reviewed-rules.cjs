'use strict';
// Original explanations, reviewed against the official August 2026 cards.
// Numbers, conditions, targets, timing and exceptions are separate audit fields.
const rule=(summary,mechanics)=>({summary,mechanics,wording:'original',automated:false});
const chapterVeteran=()=>rule('At the end of Select Operatives, a Sergeant chosen for deployment gains one additional CHAPTER TACTIC for this battle. That extra choice may change between games of a campaign or tournament.',{trigger:'end of Select Operatives',condition:'selected for deployment',target:'this operative',additionalChapterTactics:1,duration:'battle',extraChoiceLockedAcrossSeries:false});
const doctrine=(choices)=>rule('While this operative is in the killzone, Combat Doctrine costs 0CP when choosing '+choices.join(' or ')+'. Each of those choices has its own once-per-battle use.',{trigger:'use Combat Doctrine and choose a listed doctrine',condition:'this operative in killzone',costCP:0,choices,usesPerChoice:1,period:'battle',sharedBetweenChoices:false});
const operativeRules={
  '42bd-e2a7-e8f2-1d75':doctrine(['Assault','Tactical']),
  'b32f-5a76-356e-68cb':doctrine(['Devastator','Tactical']),
  '6c1f-395e-178c-f074':chapterVeteran(),
  '8a42-b55e-dea7-6baf':chapterVeteran(),
  'a86f-e1cc-1044-d60c':rule('This operative may use frag and krak grenades without consuming the limited uses available to other operatives through universal equipment. Improve the grenade weapon\'s Hit stat by 1 whenever this operative uses it.',{target:'this operative using frag or krak grenades',doesNotConsumeSharedEquipmentUses:true,hitImprovement:1,grenadeProfilesIncluded:false}),
  '743d-93f2-ab4d-f4fc':rule('Ignore Saturate when this operative is shot. It already has Stealthy; if Stealthy was also selected for the team, it may combine both cover options, retaining one normal and one critical cover save.',{trigger:'enemy operative shoots this operative',ignoreWeaponRules:['Saturate'],inherentChapterTactic:'Stealthy',ifTeamSelectedStealthy:{combineOptions:true,coverNormal:1,coverCritical:1}}),
  'ddfc-ca67-0311-6a6a':rule('Optics costs 1AP. Until this operative\'s next activation starts, its shooting ignores enemy obscured status. It cannot use this action within an enemy operative\'s control range.',{actionCostAP:1,expires:'start of this operative next activation',effect:'enemy operatives cannot be obscured when this operative shoots',prohibitedWhen:'within enemy operative control range'})
};
const tactics=[
  {name:'Aggressive',sourceId:'be68-a409-dba3-c4a3',...rule('Give this operative\'s melee weapons Rending.',{target:'this operative melee weapons',grants:['Rending']})},
  {name:'Dueller',sourceId:'4e8a-40d6-cd41-a8cf',...rule('During a fight or retaliation, each normal success may block one unresolved enemy critical success. This option is unavailable against an enemy weapon with Brutal.',{trigger:['fighting','retaliating'],normalSuccessBlocksCritical:1,exception:'enemy weapon has Brutal'})},
  {name:'Resolute',sourceId:'0bf5-117e-df33-17d0',...rule('This operative may disregard APL changes, and enemy Shock does not affect it.',{ignoreAPLChanges:true,ignoreEnemyWeaponRules:['Shock']})},
  {name:'Stealthy',sourceId:'dcf1-ebee-6e54-f64f',...rule('When shot, if any cover saves can be retained, either retain one extra cover save or retain one cover save as a critical success. Do not combine this with improved cover saves from Vantage.',{trigger:'being shot',condition:'can retain at least one cover save',options:['one additional cover save','one cover save becomes critical'],notCumulativeWith:'Vantage improved cover saves'})},
  {name:'Mobile',sourceId:'1b4e-2f28-9c65-62dd',...rule('Reduce Fall Back\'s AP cost by 1. This operative may Charge while in enemy control range and leave that range to do so; the rest of the move must meet normal Charge requirements.',{fallBackAPReduction:1,chargeFromEnemyControlRange:true,canLeaveThatControlRange:true,remainingNormalChargeRequirementsApply:true})},
  {name:'Hardy',sourceId:'653b-59d7-4cc5-21ac',...rule('When this operative is shot, defence dice showing 5+ are critical successes.',{trigger:'being shot',defenceCriticalThreshold:5})},
  {name:'Sharpshooter',sourceId:'2dcf-673c-7ca5-2e22',...rule('If this operative has not yet Charged, Fallen Back or Repositioned in its current activation, its bolt weapons gain Accurate 1 and Severe while shooting.',{trigger:'shooting during activation',condition:'no Charge, Fall Back or Reposition performed in that activation',target:'this operative bolt weapons',grants:['Accurate 1','Severe']})},
  {name:'Siege Specialist',sourceId:'7a52-f018-db34-63b1',...rule('Give this operative\'s ranged weapons Saturate. Enemy operatives cannot assist when this operative fights or retaliates.',{target:'this operative ranged weapons',grants:['Saturate'],enemyAssistanceProhibitedDuring:['fighting','retaliating']})}
];
module.exports={operativeRules,tactics,rule};
