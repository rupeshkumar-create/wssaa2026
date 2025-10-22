#!/usr/bin/env node

/**
 * Update Leader Profile Images Script
 * Updates profile images for leaders and company logos based on email addresses
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Leaders data with profile images
const leadersData = [
  {"Company Name": "eTeam","First Name": "Ranjit","Last Name": "Nair","Tittle": "Senior Vice President","Email Address": "rnair@eteaminc.com","Person Linkedin Url": "https://www.linkedin.com/in/ranjit-nair-0855bb52/","Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQHzClKhhF8Zxg/profile-displayphoto-shrink_400_400/B4EZimjCj6GcAk-/0/1755140864736?e=1762992000&v=beta&t=fg15C-1qWKk1XyI_Ox-NcDX6oW2jXXSM9U6WDBfMGUI"},
  {"Company Name": "Adecco","First Name": "Corey","Last Name": "Michaels","Tittle": "Area Operations Partner","Email Address": "corey.michaels@adeccona.com","Person Linkedin Url": "https://www.linkedin.com/in/corey-michaels-ny/","Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQEbP_bsdvNGrg/profile-displayphoto-shrink_400_400/B4EZQs_VULHEAg-/0/1735921588195?e=1762992000&v=beta&t=uPUc4ttI7Z3eI1yc03Tme-tlKQsjMo9F5iObV8mzj8w"},
  {"Company Name": "Travel Nurses","First Name": "Michelle","Last Name": "Davis","Tittle": "Chief Financial Officer","Email Address": "michelled@travelnursesinc.com","Person Linkedin Url": "https://www.linkedin.com/in/michelle-davis-4b4b446/","Profile Pic": "https://media.licdn.com/dms/image/v2/C4E03AQFB2565Glpwuw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517714039673?e=1762992000&v=beta&t=JG0Ur72But7zFcEws_MeQ9Xq3iyDBkY1SWTnbYKb5WA"},
  {"Company Name": "TekWissen Group","First Name": "Venkat","Last Name": "Swaroop","Tittle": "Associate Director","Email Address": "venkat@tekwissen.com","Person Linkedin Url": "https://www.linkedin.com/in/venkatjyothiswaroop/","Profile Pic": "https://media.licdn.com/dms/image/v2/D4D03AQFwuQMyMMCb7Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1725634816217?e=1762992000&v=beta&t=LnDJHWWFevWFZ5NXtBM56MRCo55aUKfLxVDZPuJMNGs"},
  {"Company Name": "CompuStaff","First Name": "Matt","Last Name": "Munoz","Tittle": "Senior Vice President","Email Address": "mmunoz@compustaff.com","Person Linkedin Url": "https://www.linkedin.com/in/matt-munoz-132b0a77","Profile Pic": "https://media.licdn.com/dms/image/v2/D5603AQEgQqsLlGOhzg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1685741191248?e=1762992000&v=beta&t=8DD6nTOW4StjzlN56WdEP3YZtkQmuhgBF7A4xJWStuU"},
  {"Company Name": "Horizontal","First Name": "Jeff","Last Name": "Seebinger","Tittle": "Regional Vice President","Email Address": "jseebinger@horizontalintegration.com","Person Linkedin Url": "https://www.linkedin.com/in/jeffseebinger/","Profile Pic": "https://media.licdn.com/dms/image/v2/D5603AQGhXI4nvfB6FQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1691032752083?e=1762992000&v=beta&t=7RgYKKgKuD6cHbh9fXuINgEszUvwHlvtJIK2sIOhEC0"},
  {"Company Name": "Spherion Staffing Services","First Name": "Lynn","Last Name": "Billing","Tittle": "Senior Vice President","Email Address": "lynnbilling@spherion.com","Person Linkedin Url": "https://www.linkedin.com/in/lynn-billing-cfe-046734/","Profile Pic": "https://media.licdn.com/dms/image/v2/D5603AQGz-wszaY1BlA/profile-displayphoto-shrink_400_400/B56ZeITupdH8Ak-/0/1750338563175?e=1762992000&v=beta&t=pEiyVDg679cCfSNtPn6sHFDvT5By7FT23MSnkGQvNxY"},
  {"Company Name": "Horizontal Talent","First Name": "Jeremy","Last Name": "Langevin","Tittle": "Co-Founder and CEO","Email Address": "jlangevin@horizontal.com","Person Linkedin Url": "https://www.linkedin.com/in/jeremylangevin/","Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQFBgAZPSXMZFA/profile-displayphoto-shrink_400_400/B4EZWCAU09HMAs-/0/1741642878538?e=1762992000&v=beta&t=eteypWAPdFS6M53EPGvG0Uxf5aEyEjbLzmKNaFVUuU4"},
  {"Company Name": "BCforward","First Name": "Justin","Last Name": "Christian","Tittle": "President/CEO","Email Address": "justin.christian@bcforward.com","Person Linkedin Url": "https://www.linkedin.com/in/justin-christian-2042725/","Profile Pic": "https://media.licdn.com/dms/image/v2/C4E03AQHry6wHEX2ZFw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1543945656128?e=1762992000&v=beta&t=8PZZCe8Fv_DBCM_F-M3H3wWRH4bVdwwc6fodxFcw6fw"},
  {"Company Name": "IDR","First Name": "Ashley","Last Name": "Holahan","Tittle": "President and CEO","Email Address": "aholahan@idr-inc.com","Person Linkedin Url": "https://www.linkedin.com/in/ashleyholahan/","Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQELw88pkji_ow/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1713527926306?e=1762992000&v=beta&t=L9zBJYAB3TdB_AAZKrvdOniHP3G2i-1GFeerh_HHW3Y"},
  {"Company Name": "TalentBurst","First Name": "Namrata","Last Name": "Anand","Tittle": "EVP","Email Address": "namrata.anand@talentburst.com","Person Linkedin Url": "https://www.linkedin.com/in/namrata-anand-bb22371/","Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQGFel9C8R90UQ/profile-displayphoto-shrink_400_400/B4EZR02zXKGgAs-/0/1737127311196?e=1762992000&v=beta&t=nggVG1GRQuGQaCE4zUDxHx-J7NjJVso6FBlbJJmzPmQ"},
  {"Company Name": "TekWissen","First Name": "Rajanish","Last Name": "Pandey","Tittle": "Strategy Consultant","Email Address": "rajanish.p@tekwissen.com","Person Linkedin Url": "https://www.linkedin.com/in/rajanish-pandey-4b03284b/","Profile Pic": "https://media.licdn.com/dms/image/v2/D5603AQHBLnlDJAV4KA/profile-displayphoto-shrink_400_400/B56ZYOdt_nHEAg-/0/1743999394378?e=1762992000&v=beta&t=aVjZQnMj5YjtzF5aix6e9rY3DiF-VooHfmtws2O3hEI"},
  {"Company Name": "Crown Staffing","First Name": "Marcus","Last Name": "Napier","Tittle": "Vice President","Email Address": "Marcus@crownstaffing.com","Person Linkedin Url": "https://www.linkedin.com/in/marcusnapierhelpingcompaineshiregreatpeople/","Profile Pic": "https://media.licdn.com/dms/image/v2/D5603AQG0Gp6xq1lVyw/profile-displayphoto-shrink_800_800/B56ZTm83QTHEAc-/0/1739041502600?e=1762992000&v=beta&t=fWHkhPEUoTjELDm8a9A_mFqODiAVXVn19KC84D-nONA"},
  {"Company Name": "WorldWide HealthStaff Solutions","First Name": "Ron","Last Name": "Hoppe","Tittle": "Chief Executive Officer","Email Address": "rhoppe@healthstaff.org","Person Linkedin Url": "http://www.linkedin.com/in/ron-hoppe-a72a9a2","Profile Pic": "https://media.licdn.com/dms/image/v2/D4D03AQFer1wrsu943w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1732216578524?e=1762992000&v=beta&t=DNroVlnfNmO-UwTsrKfZGfXE8jQmhP1jS-nLM6FHvy4"},
  {"Company Name": "CoWorx Staffing Services","First Name": "Amanda","Last Name": "Platia","Tittle": "Senior Vice President","Email Address": "amanda.platia@coworxstaffing.com","Person Linkedin Url": "https://www.linkedin.com/in/amandaplatia/","Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQG_nQx77B_6kQ/profile-displayphoto-shrink_400_400/B4EZThzDNBG0Ag-/0/1738955044787?e=1762992000&v=beta&t=-52Yt8choVM-_YsnzcSnwKQBUcG0OQCKGk33MV8ci44"},
  {"Company Name": "Spherion","First Name": "Lisa","Last Name": "Jock","Tittle": "Senior Vice President","Email Address": "lisajock@spherion.com","Person Linkedin Url": "https://www.linkedin.com/in/lisa-jock-09b4a67/","Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQFUispFAx-EWg/profile-displayphoto-shrink_400_400/B4EZXJP0pZHgAk-/0/1742838123556?e=1762992000&v=beta&t=H3E6OGnOn3wwLnD23kIO1OyLWAZatBKNCQXDQCj5WIg"},
  {"Company Name": "Carlton National","First Name": "Robert","Last Name": "Brown","Tittle": "CEO & CLO","Email Address": "rbrown@carltonnational.com","Person Linkedin Url": "http://www.linkedin.com/in/robertjbrownjr","Profile Pic": "https://media.licdn.com/dms/image/v2/D4E03AQFbjmxwFXNfsQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1676994696156?e=1762992000&v=beta&t=LDJBRKu8hWnCy1nhFsmZbUv17Egak1qhNrHMU61VBAw"},
  {"Company Name": "IDR","First Name": "Anna","Last Name": "Burton","Tittle": "VP of Delivery","Email Address": "aburton@idr-inc.com","Person Linkedin Url": "https://www.linkedin.com/in/anna-burton-01410820/","Profile Pic": "https://media.licdn.com/dms/image/v2/D5603AQFeaJl-HGSuIg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1731629559565?e=1762992000&v=beta&t=w0yp9VF8WPwc5_WoJ4vFppi9Omp-K31O5KpRvmsxORo"},
  {"Company Name": "Bartech Staffing","First Name": "Susan","Last Name": "Dutcher","Tittle": "Vice President of Delivery","Email Address": "sdutcher@bartechgroup.com","Person Linkedin Url": "https://www.linkedin.com/in/sdutcher/","Profile Pic": "https://media.licdn.com/dms/image/v2/D5603AQG0OFQ6nO6ddg/profile-displayphoto-scale_400_400/B56ZmI4pt5I0Ag-/0/1758938176854?e=1762992000&v=beta&t=vVSRJao7Kx30JZ72wSMplvCmFRuQwF19UAerkZiKnlg"},
  {"Company Name": "KP Staffing","First Name": "Nathan","Last Name": "Doran","Tittle": "President","Email Address": "nathan@kpstaffing.com","Person Linkedin Url": "https://www.linkedin.com/in/nathan-doran-25b80951/","Profile Pic": "https://media.licdn.com/dms/image/v2/D5603AQHHrYAefdOxTw/profile-displayphoto-shrink_400_400/B56ZbUcbRRHUAs-/0/1747320946419?e=1762992000&v=beta&t=idwWj0oqvKrTFknI40ZCJWRh2EnjaMgZec41rfnvtVM"},
  {"Company Name": "20four7VA","First Name": "Catherine","Last Name": "vanVonno","Tittle": "President and CEO","Email Address": "jennifer.delrosario@20four7va.com","Person Linkedin Url": "https://www.linkedin.com/in/catherinevanvonno/","Profile Pic": ""},
  {"Company Name": "KP Staffing","First Name": "Christine","Last Name": "Doran","Tittle": "CMO","Email Address": "christine@kpstaffing.com","Person Linkedin Url": "https://www.linkedin.com/in/doran-christine","Profile Pic": "https://media.licdn.com/dms/image/v2/D5603AQGaHWcjDcKFUg/profile-displayphoto-scale_400_400/B56Znp8byhG0Ag-/0/1760566558823?e=1762992000&v=beta&t=cr2xqnANuJe3WkmQt0kfGtO4IBP6GLuKnbMf5eKTPuQ"}
];

// Company logos data
const companyLogosData = [
  {"Company Name": "eTeam","First Name": "Ann","Last Name": "Thakur","Linkedin URL": "https://www.linkedin.com/company/eteam/","Email Address": "athakur@eteaminc.com","Logo": "https://media.licdn.com/dms/image/v2/D560BAQHIX6ke6qNgVg/company-logo_200_200/company-logo_200_200/0/1719820690492/eteam_logo?e=1762992000&v=beta&t=Gz1TvU_57WOiI0C3XgDcMSPR5bBJkoWEdA-wgBYmPNM"},
  {"Company Name": "TEKWISSEN","First Name": "Surya","Last Name": "Kadiri","Linkedin URL": "https://www.linkedin.com/company/tekwissen/","Email Address": "surya.k@tekwissen.com","Logo": "https://media.licdn.com/dms/image/v2/D4E0BAQGi0JFr3ZNUqQ/company-logo_200_200/company-logo_200_200/0/1719838772435/tekwissen_logo?e=1762992000&v=beta&t=QAzlVnh-8OShTPdFPk4ROAB0dFV52FCHUXnSZEovnBU"},
  {"Company Name": "Travel Nurses","First Name": "Bethany","Last Name": "Stover","Linkedin URL": "https://www.linkedin.com/company/travel-nurses-inc","Email Address": "bethany@travelnursesinc.com","Logo": "https://media.licdn.com/dms/image/v2/D4E0BAQF8s6YhlPlhUA/company-logo_200_200/company-logo_200_200/0/1706017815173/travel_nurses_inc_logo?e=1762992000&v=beta&t=HXeKnl0OCttAI4oMfzrceeCwNj-vwcqFO9WKRVl2GRg"},
  {"Company Name": "Impellam Group","First Name": "Claire","Last Name": "Marsh","Linkedin URL": "https://www.linkedin.com/company/impellamgroup/","Email Address": "claire.marsh@lorienglobal.com","Logo": "https://media.licdn.com/dms/image/v2/D4E0BAQG6SvFIh1x8UQ/company-logo_200_200/company-logo_200_200/0/1719827465349/impellamgroup_logo?e=1762992000&v=beta&t=UOzqLOwIj7b7QIcc4CkuZCe5maOYTubs1NmZCflOR-Q"},
  {"Company Name": "Horizontal","First Name": "Jeff","Last Name": "Seebinger","Linkedin URL": "https://www.linkedin.com/company/horizontal-talent/","Email Address": "jseebinger@horizontalintegration.com","Logo": "https://media.licdn.com/dms/image/v2/D560BAQFM_CttJdNzEA/company-logo_200_200/company-logo_200_200/0/1720644447675/horizontal_talent_logo?e=1762992000&v=beta&t=qfOG4ZDQsNjKtqfZZAUEXqY9I3-OVsXBPjUTvNnieTQ"},
  {"Company Name": "Spherion","First Name": "Gina","Last Name": "Workman","Linkedin URL": "http://www.linkedin.com/company/spherion","Email Address": "ginaworkman@spherion.com","Logo": "https://media.licdn.com/dms/image/v2/C4E0BAQFkUsdOlJ-yXQ/company-logo_200_200/company-logo_200_200/0/1636746605356/spherion_logo?e=1762992000&v=beta&t=C3IYLDgkJ3Izh5bAJAtNzZLz7HnfOEdYkDsvHGF1h50"},
  {"Company Name": "IDR","First Name": "Ashley","Last Name": "Holahan","Linkedin URL": "https://www.linkedin.com/company/idrinc/","Email Address": "aholahan@idr-inc.com","Logo": "https://media.licdn.com/dms/image/v2/D560BAQHpu2gLxz2S0Q/company-logo_200_200/company-logo_200_200/0/1688151992962/idrinc_logo?e=1762992000&v=beta&t=eDwJV5zaO1_h9JQPoUvdgMXnWbmrEcIkRCtxxicODkQ"},
  {"Company Name": "Mitchell Martin","First Name": "Mike","Last Name": "Viso","Linkedin URL": "https://www.linkedin.com/company/mitchell-martin/","Email Address": "mike.viso@itmmi.com","Logo": "https://media.licdn.com/dms/image/v2/D4E0BAQE10HSS2aQUag/company-logo_200_200/B4EZm7IHF.GcAI-/0/1759781090529/mitchell_martin_logo?e=1762992000&v=beta&t=ho1QhpIscsqJ297fWQnQAIX1lHlTOLJWDJZV1TiX0e8"},
  {"Company Name": "Matlen Silver","First Name": "Scott","Last Name": "Haines","Linkedin URL": "https://www.linkedin.com/company/matlen-silver/","Email Address": "shaines@matlensilver.com","Logo": "https://media.licdn.com/dms/image/v2/C560BAQHQ7dB4QLgg6w/company-logo_200_200/company-logo_200_200/0/1630641121255/matlen_silver_logo?e=1762992000&v=beta&t=HMFK_tzVr5AKOXt_5ztmnH2rJrHNkE-T6TR87zRe5nM"},
  {"Company Name": "BCforward","First Name": "Justin","Last Name": "Christian","Linkedin URL": "https://www.linkedin.com/company/bcforward/","Email Address": "justin.christian@bcforward.com","Logo": "https://media.licdn.com/dms/image/v2/D560BAQF-58cvJAABug/company-logo_200_200/company-logo_200_200/0/1708016840492/bcforward_logo?e=1762992000&v=beta&t=Dbfg3ag4cG-0drIIBqYnAs2_oTrK7unSktDM1FvcUK8"},
  {"Company Name": "TalentBurst","First Name": "Jamie","Last Name": "Jacobson","Linkedin URL": "https://www.linkedin.com/company/talentburst/","Email Address": "jamie.jacobs@talentburst.com","Logo": "https://media.licdn.com/dms/image/v2/D560BAQH7m2F4U2QHgA/company-logo_200_200/company-logo_200_200/0/1708538368421/talentburst_logo?e=1762992000&v=beta&t=gO61e80yKB4xx3uRRXYfZ8_4snYIXS0D-0v9q6Ctyz8"},
  {"Company Name": "WorldWide HealthStaff","First Name": "Ron","Last Name": "Hoppe","Linkedin URL": "http://www.linkedin.com/company/worldwidehealthstaff","Email Address": "rhoppe@healthstaff.org","Logo": "https://media.licdn.com/dms/image/v2/D4E0BAQG1KAoGsgaHvQ/company-logo_200_200/B4EZUEoMomHUAI-/0/1739539401613/worldwidehealthstaff_logo?e=1762992000&v=beta&t=3Oe8z9CPzMfFXB_ydeTzXOHoxGeDfog63aosw2HpRGo"},
  {"Company Name": "SURESTAFF","First Name": "Sandy","Last Name": "Picciola","Linkedin URL": "https://www.linkedin.com/company/surestaffinc/","Email Address": "spicciola@sure-staff.com","Logo": "https://media.licdn.com/dms/image/v2/D560BAQETqUGLSKISAw/company-logo_200_200/company-logo_200_200/0/1732141498949/surestaffinc_logo?e=1762992000&v=beta&t=AVGwJNC0fsJDNsLH1hBAWCW4UXqCxHNLf_yJTPzvIsY"},
  {"Company Name": "KP Staffing","First Name": "Jasmyn","Last Name": "Padilla","Linkedin URL": "https://www.linkedin.com/company/kpstaffing/","Email Address": "jasmyn@kpstaffing.com","Logo": "https://media.licdn.com/dms/image/v2/C560BAQH2uyqvW5LkRw/company-logo_200_200/company-logo_200_200/0/1655145771145/kpstaffing_logo?e=1762992000&v=beta&t=teX9LXPR4QnQ8b0jDC1j3rTlb7PRbW8xk3XWT1S5f7E"},
  {"Company Name": "Carlton National","First Name": "Robert","Last Name": "Brown","Linkedin URL": "http://www.linkedin.com/company/carltonnationalresources","Email Address": "rbrown@carltonnational.com","Logo": "https://media.licdn.com/dms/image/v2/D4E0BAQHlfl1mwxsAHA/company-logo_200_200/company-logo_200_200/0/1722977288471/carltonnationalresources_logo?e=1762992000&v=beta&t=MmXBmv3d0wBP2NEjySKqNFSpBy1FWE8gPHEH8K-3D_E"},
  {"Company Name": "CoWorx Staffing Services","First Name": "Christine","Last Name": "Bowden","Linkedin URL": "https://www.linkedin.com/company/coworx-staffing-services/","Email Address": "Christine.Bowden@coworxstaffing.com","Logo": "https://media.licdn.com/dms/image/v2/D4E0BAQF8Ux-v5AQrHA/company-logo_200_200/company-logo_200_200/0/1734989595847/coworx_staffing_services_logo?e=1762992000&v=beta&t=Qfn2tP_htMbDaYuX-LqYHrF3UQeg46i9_5n2-FRDz40"},
  {"Company Name": "20four7VA","First Name": "Jennifer","Last Name": "Del Rosario","Linkedin URL": "https://www.linkedin.com/company/20four7va/","Email Address": "jennifer.delrosario@20four7va.com","Logo": "https://media.licdn.com/dms/image/v2/C4D0BAQHpA8N_TxKAeQ/company-logo_200_200/company-logo_200_200/0/1630579176017/20four7va_logo?e=1762992000&v=beta&t=kbT-WEBxCTnfUFsUoXNkIhFshLFd-G9xIoL0zVKncQE"},
  {"Company Name": "Onward Search","First Name": "Eliana","Last Name": "Hassen","Linkedin URL": "http://www.linkedin.com/company/onward-search","Email Address": "ehassen@onwardsearch.com","Logo": "https://media.licdn.com/dms/image/v2/D4E0BAQFmgd07x1gnjQ/company-logo_200_200/B4EZfGdWqQHgAI-/0/1751381273575/onward_search_logo?e=1762992000&v=beta&t=aDBVIByiRoN01EvTUSROUoHF5DIpLOeZdrVaWiKKCbs"},
  {"Company Name": "Peoplelink Group","First Name": "Christophe","Last Name": "Jeusse","Linkedin URL": "https://www.linkedin.com/company/peoplelink-group/","Email Address": "christophe.jeusse@peoplelinkgroup.com","Logo": "https://media.licdn.com/dms/image/v2/C560BAQG3kFQTK2XEMA/company-logo_200_200/company-logo_200_200/0/1655852676125/peoplelink_group_logo?e=1762992000&v=beta&t=VMWBhZvFYaC5OAPGYm4a8Pg20NPi1TkOcPbKATW2zug"},
  {"Company Name": "APC","First Name": "Troy","Last Name": "Roberts","Linkedin URL": "http://www.linkedin.com/company/apcjobs","Email Address": "troberts@apcinc.com","Logo": "https://media.licdn.com/dms/image/v2/D4D0BAQGeHgzitKET7g/company-logo_200_200/company-logo_200_200/0/1704297756574/apcjobs_logo?e=1762992000&v=beta&t=ZdyMCMyaYjRSTmc95Q5tmv-M5p-LyKutg2RiIivaolM"},
  {"Company Name": "Bartech Staffing","First Name": "Susan","Last Name": "Dutcher","Linkedin URL": "https://www.linkedin.com/company/bartech-staffing/","Email Address": "sdutcher@bartechgroup.com","Logo": "https://media.licdn.com/dms/image/v2/D560BAQHFlD5YRNf2Xg/company-logo_200_200/company-logo_200_200/0/1721149893123/bartech_staffing_logo?e=1762992000&v=beta&t=YyWyWcB56sMijHMZ_O6zRDTaLihz3vmIk6GKIsp36fQ"},
  {"Company Name": "Adecco","First Name": "Vanessa","Last Name": "Valdez","Linkedin URL": "https://www.linkedin.com/company/adecco/about/","Email Address": "vanessa.indiravaldez@adecco.com","Logo": "https://media.licdn.com/dms/image/v2/C510BAQEeK1BH5vKw8Q/company-logo_200_200/company-logo_200_200/0/1631346849445?e=1762992000&v=beta&t=YWBk9lvEYBiD0U6pB8S_zmIIFPQtj60UmJxkKdu_vH0"}
];

async function updateLeaderProfileImages() {
  console.log('🚀 Starting leader profile image updates...');

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let updatedCount = 0;
  let notFoundCount = 0;

  // Update person nominees (leaders)
  console.log('\n📸 Updating person nominee profile images...');
  
  for (const leader of leadersData) {
    const email = leader['Email Address'];
    const profilePic = leader['Profile Pic'];
    const firstName = leader['First Name'];
    const lastName = leader['Last Name'];

    if (!email || !profilePic) {
      console.log(`⚠️  Skipping ${firstName} ${lastName} - missing email or profile pic`);
      continue;
    }

    try {
      // Find nominee by email
      const { data: nominees, error: findError } = await supabase
        .from('nominees')
        .select('id, firstname, lastname, person_email, headshot_url')
        .eq('type', 'person')
        .eq('person_email', email);

      if (findError) {
        console.error(`❌ Error finding nominee for ${email}:`, findError.message);
        continue;
      }

      if (!nominees || nominees.length === 0) {
        console.log(`⚠️  No nominee found for email: ${email} (${firstName} ${lastName})`);
        notFoundCount++;
        continue;
      }

      const nominee = nominees[0];
      
      // Update headshot URL
      const { error: updateError } = await supabase
        .from('nominees')
        .update({ 
          headshot_url: profilePic,
          updated_at: new Date().toISOString()
        })
        .eq('id', nominee.id);

      if (updateError) {
        console.error(`❌ Error updating ${firstName} ${lastName}:`, updateError.message);
        continue;
      }

      console.log(`✅ Updated ${firstName} ${lastName} (${email})`);
      updatedCount++;

    } catch (error) {
      console.error(`❌ Unexpected error for ${firstName} ${lastName}:`, error.message);
    }
  }

  // Update company nominees (logos)
  console.log('\n🏢 Updating company nominee logos...');
  
  for (const company of companyLogosData) {
    const companyName = company['Company Name'];
    const logo = company['Logo'];
    const email = company['Email Address'];

    if (!companyName || !logo) {
      console.log(`⚠️  Skipping ${companyName} - missing company name or logo`);
      continue;
    }

    try {
      // Find company nominee by name (case insensitive)
      const { data: nominees, error: findError } = await supabase
        .from('nominees')
        .select('id, company_name, logo_url')
        .eq('type', 'company')
        .ilike('company_name', `%${companyName}%`);

      if (findError) {
        console.error(`❌ Error finding company for ${companyName}:`, findError.message);
        continue;
      }

      if (!nominees || nominees.length === 0) {
        console.log(`⚠️  No company nominee found for: ${companyName}`);
        notFoundCount++;
        continue;
      }

      // Update all matching companies (in case of multiple entries)
      for (const nominee of nominees) {
        const { error: updateError } = await supabase
          .from('nominees')
          .update({ 
            logo_url: logo,
            updated_at: new Date().toISOString()
          })
          .eq('id', nominee.id);

        if (updateError) {
          console.error(`❌ Error updating company ${companyName}:`, updateError.message);
          continue;
        }

        console.log(`✅ Updated company logo for ${nominee.company_name}`);
        updatedCount++;
      }

    } catch (error) {
      console.error(`❌ Unexpected error for company ${companyName}:`, error.message);
    }
  }

  console.log('\n📊 Update Summary:');
  console.log(`✅ Successfully updated: ${updatedCount}`);
  console.log(`⚠️  Not found: ${notFoundCount}`);
  console.log(`📝 Total processed: ${leadersData.length + companyLogosData.length}`);

  // Verify some updates
  console.log('\n🔍 Verifying updates...');
  
  const { data: sampleNominees, error: verifyError } = await supabase
    .from('nominees')
    .select('firstname, lastname, company_name, headshot_url, logo_url, type')
    .or('headshot_url.not.is.null,logo_url.not.is.null')
    .limit(5);

  if (verifyError) {
    console.error('❌ Error verifying updates:', verifyError.message);
  } else {
    console.log('Sample updated nominees:');
    sampleNominees.forEach(nominee => {
      if (nominee.type === 'person') {
        console.log(`  👤 ${nominee.firstname} ${nominee.lastname}: ${nominee.headshot_url ? '✅ Has image' : '❌ No image'}`);
      } else {
        console.log(`  🏢 ${nominee.company_name}: ${nominee.logo_url ? '✅ Has logo' : '❌ No logo'}`);
      }
    });
  }

  console.log('\n🎉 Profile image update completed!');
}

// Run the update
if (require.main === module) {
  updateLeaderProfileImages().catch(console.error);
}

module.exports = { updateLeaderProfileImages };