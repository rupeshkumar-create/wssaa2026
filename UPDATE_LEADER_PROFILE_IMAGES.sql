-- Update Leader Profile Images SQL Script
-- This script updates profile images for leaders and company logos

-- Update person nominees (leaders) with their profile images
-- Match by email address and update headshot_url

-- Ranjit Nair - eTeam
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQHzClKhhF8Zxg/profile-displayphoto-shrink_400_400/B4EZimjCj6GcAk-/0/1755140864736?e=1762992000&v=beta&t=fg15C-1qWKk1XyI_Ox-NcDX6oW2jXXSM9U6WDBfMGUI',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rnair@eteaminc.com';

-- Corey Michaels - Adecco
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQEbP_bsdvNGrg/profile-displayphoto-shrink_400_400/B4EZQs_VULHEAg-/0/1735921588195?e=1762992000&v=beta&t=uPUc4ttI7Z3eI1yc03Tme-tlKQsjMo9F5iObV8mzj8w',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'corey.michaels@adeccona.com';

-- Michelle Davis - Travel Nurses
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQFB2565Glpwuw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517714039673?e=1762992000&v=beta&t=JG0Ur72But7zFcEws_MeQ9Xq3iyDBkY1SWTnbYKb5WA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'michelled@travelnursesinc.com';

-- Venkat Swaroop - TekWissen Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4D03AQFwuQMyMMCb7Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1725634816217?e=1762992000&v=beta&t=LnDJHWWFevWFZ5NXtBM56MRCo55aUKfLxVDZPuJMNGs',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'venkat@tekwissen.com';

-- Matt Munoz - CompuStaff
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEgQqsLlGOhzg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1685741191248?e=1762992000&v=beta&t=8DD6nTOW4StjzlN56WdEP3YZtkQmuhgBF7A4xJWStuU',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'mmunoz@compustaff.com';

-- Jeff Seebinger - Horizontal
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQGhXI4nvfB6FQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1691032752083?e=1762992000&v=beta&t=7RgYKKgKuD6cHbh9fXuINgEszUvwHlvtJIK2sIOhEC0',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jseebinger@horizontalintegration.com';

-- Lynn Billing - Spherion Staffing Services
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQGz-wszaY1BlA/profile-displayphoto-shrink_400_400/B56ZeITupdH8Ak-/0/1750338563175?e=1762992000&v=beta&t=pEiyVDg679cCfSNtPn6sHFDvT5By7FT23MSnkGQvNxY',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'lynnbilling@spherion.com';

-- Jeremy Langevin - Horizontal Talent
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFBgAZPSXMZFA/profile-displayphoto-shrink_400_400/B4EZWCAU09HMAs-/0/1741642878538?e=1762992000&v=beta&t=eteypWAPdFS6M53EPGvG0Uxf5aEyEjbLzmKNaFVUuU4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jlangevin@horizontal.com';

-- Justin Christian - BCforward
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQHry6wHEX2ZFw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1543945656128?e=1762992000&v=beta&t=8PZZCe8Fv_DBCM_F-M3H3wWRH4bVdwwc6fodxFcw6fw',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'justin.christian@bcforward.com';

-- Ashley Holahan - IDR
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQELw88pkji_ow/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1713527926306?e=1762992000&v=beta&t=L9zBJYAB3TdB_AAZKrvdOniHP3G2i-1GFeerh_HHW3Y',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'aholahan@idr-inc.com';

-- Namrata Anand - TalentBurst
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQGFel9C8R90UQ/profile-displayphoto-shrink_400_400/B4EZR02zXKGgAs-/0/1737127311196?e=1762992000&v=beta&t=nggVG1GRQuGQaCE4zUDxHx-J7NjJVso6FBlbJJmzPmQ',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'namrata.anand@talentburst.com';

-- Rajanish Pandey - TekWissen
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHBLnlDJAV4KA/profile-displayphoto-shrink_400_400/B56ZYOdt_nHEAg-/0/1743999394378?e=1762992000&v=beta&t=aVjZQnMj5YjtzF5aix6e9rY3DiF-VooHfmtws2O3hEI',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rajanish.p@tekwissen.com';

-- Marcus Napier - Crown Staffing
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQG0Gp6xq1lVyw/profile-displayphoto-shrink_800_800/B56ZTm83QTHEAc-/0/1739041502600?e=1762992000&v=beta&t=fWHkhPEUoTjELDm8a9A_mFqODiAVXVn19KC84D-nONA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'Marcus@crownstaffing.com';

-- Ron Hoppe - WorldWide HealthStaff Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4D03AQFer1wrsu943w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1732216578524?e=1762992000&v=beta&t=DNroVlnfNmO-UwTsrKfZGfXE8jQmhP1jS-nLM6FHvy4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rhoppe@healthstaff.org';

-- Amanda Platia - CoWorx Staffing Services
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQG_nQx77B_6kQ/profile-displayphoto-shrink_400_400/B4EZThzDNBG0Ag-/0/1738955044787?e=1762992000&v=beta&t=-52Yt8choVM-_YsnzcSnwKQBUcG0OQCKGk33MV8ci44',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'amanda.platia@coworxstaffing.com';

-- Lisa Jock - Spherion
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFUispFAx-EWg/profile-displayphoto-shrink_400_400/B4EZXJP0pZHgAk-/0/1742838123556?e=1762992000&v=beta&t=H3E6OGnOn3wwLnD23kIO1OyLWAZatBKNCQXDQCj5WIg',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'lisajock@spherion.com';

-- Robert Brown - Carlton National
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFbjmxwFXNfsQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1676994696156?e=1762992000&v=beta&t=LDJBRKu8hWnCy1nhFsmZbUv17Egak1qhNrHMU61VBAw',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rbrown@carltonnational.com';

-- Anna Burton - IDR
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFeaJl-HGSuIg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1731629559565?e=1762992000&v=beta&t=w0yp9VF8WPwc5_WoJ4vFppi9Omp-K31O5KpRvmsxORo',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'aburton@idr-inc.com';

-- Susan Dutcher - Bartech Staffing
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQG0OFQ6nO6ddg/profile-displayphoto-scale_400_400/B56ZmI4pt5I0Ag-/0/1758938176854?e=1762992000&v=beta&t=vVSRJao7Kx30JZ72wSMplvCmFRuQwF19UAerkZiKnlg',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'sdutcher@bartechgroup.com';

-- Nathan Doran - KP Staffing
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHHrYAefdOxTw/profile-displayphoto-shrink_400_400/B56ZbUcbRRHUAs-/0/1747320946419?e=1762992000&v=beta&t=idwWj0oqvKrTFknI40ZCJWRh2EnjaMgZec41rfnvtVM',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'nathan@kpstaffing.com';

-- Christine Doran - KP Staffing
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQGaHWcjDcKFUg/profile-displayphoto-scale_400_400/B56Znp8byhG0Ag-/0/1760566558823?e=1762992000&v=beta&t=cr2xqnANuJe3WkmQt0kfGtO4IBP6GLuKnbMf5eKTPuQ',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'christine@kpstaffing.com';

-- Gene Holtzman - Mitchell Martin
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQH3fpQkrn7Ruw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517669637083?e=1762992000&v=beta&t=6YfbD2ZABB1GtpJkPBupzzv0778RMgQKAtH7-FwT1ys',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'gholtzman@itmmi.com';

-- Jamie Jacobs - TalentBurst
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEwfDYAVuh-5A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1726157314534?e=1762992000&v=beta&t=URDiGZqMvvoVfCJVrF4xkP3sb8DiPybmC2vwFC2My_8',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jamie.jacobs@talentburst.com';

-- Jacob Pruis - BCforward
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQH36L-q6Q4gCg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1686257726596?e=1762992000&v=beta&t=LpsN2qDpn9gvX93iUyjlDcL4ivFGDOpTlYdZksQ23zs',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jacob.pruis@bcforward.com';

-- Alfin Gustian Akbar - Adecco
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQF_u2OQC4tK1Q/profile-displayphoto-shrink_400_400/B56Zd9OySbHUAg-/0/1750152718563?e=1762992000&v=beta&t=reRGwa5P9S8JCeEe8Jzxg3jwgUs0FqTJgo77s8hNqak',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'alfin.gustian@adecco.com';

-- Ken Clark - Onward Search
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQFdZjgjSuYrdg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1569275550888?e=1762992000&v=beta&t=wVPXGfUAJSc5gH_crsYXnrbw04NxAMwk3HLSVCefZ5E',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'ken@onwardsearch.com';

-- Sandy Picciola - SURESTAFF
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQH0lP1zGWj4Sg/profile-displayphoto-scale_400_400/B56ZgJMUVuGUAg-/0/1752500881230?e=1762992000&v=beta&t=EY5-fhGhxFJawjDSC5uq7uMO567D2kICz54zautyL6g',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'spicciola@sure-staff.com';

-- Joshua Holtzman - Mitchell Martin
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4D03AQHk5nGIIsqA3g/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516483510750?e=1762992000&v=beta&t=vjdBy0qiXj6YHa1_AHWewHLamPhQS0LBgP3rSwAiubE',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jholtzman@itmmi.com';

-- Rachel Slowey - ElevaIT Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFcj2ovp_tKUA/profile-displayphoto-scale_400_400/B4EZgQ7wm8GcAk-/0/1752630758831?e=1762992000&v=beta&t=buWT8GCjUE8z-XwoHpJMUEqY16Mw3xFIhVu1Jt9loqU',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rachel.slowey@elevait.tech';

-- Andy Jones - Medix
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C5603AQFDnUVj2GqrCg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1653962735762?e=1762992000&v=beta&t=z53SkwTlWVbXQngNc2o5A5r2rEFE3sFjKh8bm2XUsgA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'ajones@medixteam.com';

-- Lee Boelens - GDH Consulting
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4D03AQE2VZyr91LoLg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1668096206223?e=1762992000&v=beta&t=Bd26sXyEDQH0jNboVe75hJ52w9HfPfrMbPQ9mN-ZzA0',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'lboelens@gdhinc.com';

-- JJ Hurley - GDH Consulting
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C5603AQEvjLzvpazz8Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1668116160826?e=1762992000&v=beta&t=7cYG38Kh2Pt91spn3mktpN0sZkMEBen1KhTuIKSQTXM',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jj@gdhinc.com';

-- Mike Viso - Mitchell Martin
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQE3E6VkxFRu8Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1726450791427?e=1762992000&v=beta&t=Mo1bsI4Acvh4zgYINUOGTyDzWWvRaX52ZA8r0xpI0U4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'mike.viso@itmmi.com';

-- Rebeca Martinez - IDEAL Personnel Services
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQHGKVsJz4OG-g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1612967895209?e=1762992000&v=beta&t=TIUs7NA_mc1Q7Nt_nqoNguS6wfgI3CWjBYezDIUNWeQ',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rmartinez@ideal-personnel.com';

-- Christophe Jeusse - Peoplelink Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEMA_4aVrEahw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1665088461554?e=1762992000&v=beta&t=qRR6l9bOJ5jrGDLPS0luWffligCQ1SGbrbB6RRrt-Zw',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'christophe.jeusse@peoplelinkgroup.com';

-- Marlinda Friend - NW Staffing Resources
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5635AQFcYmNa7QfaFg/profile-framedphoto-shrink_400_400/B56ZkbMnGKI4Ac-/0/1757097915069?e=1761728400&v=beta&t=z47KFSq89KtxnCgMI46hYktJVeD2jpN4UbjXo2srnZw',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'mfriend@nwstaffing.com';

-- Sai Teja Saragada - TekWissen
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFZj6T8xnr8wA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1728061810205?e=1762992000&v=beta&t=wyetQwWKshTouGAEze4U9HcwddcrrMoMaJZxBDlSQ5k',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'sai.s@tekwissen.com';

-- Alan Craig - QX Global Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E35AQHxhQop7Cncpg/profile-framedphoto-shrink_400_400/B4EZntvZ3EGUAc-/0/1760630251183?e=1761728400&v=beta&t=RqR5rhyPQQj8jGU2BpwztOrmBvr-V26mf8BnJY1gb60',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'alandcraig@btinternet.com';

-- Kelly Bathgate - Peoplelink Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEa4hOaZ7d_Dg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1708023493219?e=1762992000&v=beta&t=NCK5JwmOkvAbRxuCmAj7pqAc2Lye2ED6RDSbR07jeUA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'kbathgate@peoplelinkgroup.com';

-- Leah Pelletier - Acro Service Corp
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHt12SIqVgz3g/profile-displayphoto-shrink_400_400/B56ZdUleC.HUAk-/0/1749470799019?e=1762992000&v=beta&t=JJnEpmQhga8JdcQjFVvberf11Yo4j36LMrmYXC5miqE',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'lpelletier@acrocorp.com';

-- Blaine Caples - GDH Consulting
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQH1Q1wkE9LAHQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1669735723623?e=1762992000&v=beta&t=lO0X3nZqkt3aAPiZLYQK8Ox5tZSM3EoWGRf7vkSDNJU',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'bcaples@gdhinc.com';

-- Damien Howard - Grant Wagner
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQG_dyQlV-auPA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1686019193407?e=1762992000&v=beta&t=_TTEL8AF1NIkz5uurlum6kgdD1S9LMXGjpOzdG4Wmqo',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'damien.howard@grantwagnertalent.com';

-- Denise Stalker - TalentProcure
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFGRvZ4s1lpIw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1694636450296?e=1762992000&v=beta&t=_HbXuljvlFzWW_dKfhMtwbIXlnymMKwksxAkj5LpGTc',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jamie.jacobs@talentburst.com';

-- Kristina Djokic - Acro Service Corp
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFq88TDJbmW_A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1719325014464?e=1762992000&v=beta&t=8kXSz3TbsWo4GNpwcHTFMbwfsBGR4gpuZx4Q5zwWm98',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'kdjokic@acrocorp.com';

-- Marsha Murray - Murray Resources
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQG9hjHP3a7mAg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1699930997279?e=1762992000&v=beta&t=IbOtbcnKG1d0aXQKR2FgmNiVQps977cxCoU1H8ge_IM',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'mmurray@murrayresources.com';

-- Meron Sheriff - ElevaIT Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQE-DPlNIe6Ubg/profile-displayphoto-shrink_800_800/B56Zbwj8R7G4Ak-/0/1747792677310?e=1762992000&v=beta&t=dlx1KqgtTtLTC0ciidERVYf73cUUMEQg3F9Gy2jRla8',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'meron.sheriff@elevait.tech';

-- Byrne Luft - TAPP Workforce Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEtaBeSKbQBeA/profile-displayphoto-shrink_800_800/B56ZkikYYhHAAc-/0/1757221587155?e=1762992000&v=beta&t=0OAtaSM6PKspG-4EljwCxMSsNHpHUbjXuyONYH82WY4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'byrne.luft@archstaffing.ca';

-- Megan Mccann - McCann Partners
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQGoijmt_WK2Zw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1707877026525?e=1762992000&v=beta&t=PmCGGlqgbO__4RRTz2DmsWu22mNdgUF3fldqN5VEP9o',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'mmccann@mccannpartners.com';

-- Stacey Bigelow - The Advance Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFNhxDPDqm9uA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1670446147593?e=1762992000&v=beta&t=hWb58tN2vHr5Vha5iY5SS--KNJ-ezguun0XE2kLi2tA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'stacey@theadvancegroupjobs.com';

-- Troy Roberts - APC
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4D03AQEaV383a-5U7A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1664309457111?e=1762992000&v=beta&t=OasKe--aw2OkLI5OuayHl_XcKYFXEuZ7NgwS5LNh9XQ',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'troberts@apcinc.com';

-- Scott Roberts - APC
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHGYozFoH_LnQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1731008421799?e=1762992000&v=beta&t=BRBX7jWvWg9oN9rzgAsPvmP_GjUd-4JzFlYH3t2UbYM',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'sroberts@apcinc.com';

-- Bryan Burnett - Travel Nurses
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQEWu_t-hdWqWA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1678122349963?e=1762992000&v=beta&t=W7ZwfrmsGnxuUyF2cX7D-JEWn-JnZUGiYYNRF8bzrAA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'bryanb@travelnursesinc.com';

-- Niccole Workman - Acro Service Corp
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFPs2t1Df375g/profile-displayphoto-shrink_400_400/B4EZcYxCI6HsAg-/0/1748467196806?e=1762992000&v=beta&t=Gk5sU3oiPRb0qjvZURLRhs66os7xEP2rfhdp1CMCH9s',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'nworkman@acrobluestaffing.com';

-- Edith Carmichael - Freshminds
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C5603AQH_BIWRc-PSng/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1572263618808?e=1762992000&v=beta&t=UPA0U0qyUgE8j55-dZG5TBXuI-ux6qIzCqSyjurbT9s',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'edith.carmichael@freshminds.co.uk';

-- Robert Bouchard - Tier4 Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4D03AQE3MvetFpvynQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1592341409744?e=1762992000&v=beta&t=YReO3mukz2vzpFhyN_oy-h80NR6qcFI91dtOwgZpa80',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'robert@tier4group.com';

-- Wendie Richards - NW Staffing Resources
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQFEJjJo7y9d7A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1517692333514?e=1762992000&v=beta&t=8Y0Px__oJKMBykrIZvhErwEqetd-L5CmfmwletTqRxY',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'wrichards@nwstaffing.com';

-- Urbanette Marks - Loyal Source Government Services
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQEDndVJHeDL6Q/profile-displayphoto-scale_400_400/B4EZf5RI3lHwAg-/0/1752233710010?e=1762992000&v=beta&t=MqwItT4j0hGHw-5hnrjxW8QK7fPoogT53hNn89CjQ2I',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'umarks@loyalsource.com';

-- Benjamin Phipps - Tential Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4D03AQEuUcwXorap7g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1516429546278?e=1762992000&v=beta&t=Y-xIy1qW5jPqf8DDbPP_zCIbW3Cq21JuFYfU6Ja-OJg',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'bphipps@tential.com';

-- Heidi Sullivan - Fast Switch
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQFnokM9fbswKQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1641415217329?e=1762992000&v=beta&t=tF-FrFz3JUr041FXewlA8GqRfG6XPq_fHrX5TX3OSB4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'hsullivan@fastswitch.com';

-- Cristina Duncan - Travel Nurses
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQG2lNVovFq-tQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1697501294045?e=1762992000&v=beta&t=ewPEvE1z6S5vX2I7cQo-0BIQAf6TxC_wFl7NvZ_T3pU',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'cristinad@travelnursesinc.com';

-- Nitin Maithani - TekWissen
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHXZ-NscYx2ow/profile-displayphoto-shrink_400_400/B56ZcKrh2SHoAg-/0/1748230874099?e=1762992000&v=beta&t=nd8-pQVpC96EUz6pWjPkXP4ty2AeLwOZtQsMMRNAeO4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'Nitin.m@tekwissen.com';

-- Julie Labrie - BlueSky Personnel Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5635AQGHKM3Noqiu5Q/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1736184150315?e=1761728400&v=beta&t=76oTMaNlgwF3oMjtdCiN_92VmBw9X2erA8lv6Twx9zg',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'julie@blueskypersonnel.com';

-- Lori Coates - Travel Nurses
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEK0oyigGfWTw/profile-displayphoto-scale_400_400/B56ZikbwA9HkAk-/0/1755105395957?e=1762992000&v=beta&t=4vUZn8LLWYTIUcNpL-ytCKTJXavsi0fT22WFQOBoEew',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'loric@travelnursesinc.com';

-- Christiane Hauk - RMIT Professional Resources
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQHBVaP3q6oBuw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1695193255994?e=1762992000&v=beta&t=UGNYdKXUP_OjYwhP_zziEGXyOi9QK1DoTSeXd1guNWs',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'christiane.hauk@rmgroup.ch';

-- Lea Tal - Tal Healthcare
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4D03AQHtyCgPzmjvZg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1648741548287?e=1762992000&v=beta&t=TbNP798ZcZKgmXnzk9hqk-lYtSkRGgmxSk5e72Cm79M',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'ltal@talhealthcare.com';

-- Kristy Pierce - Encore Talent Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFwdQXbcguq7w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1728245523635?e=1762992000&v=beta&t=MDCZxjh4eUdj0btR1Qvd--LrfiV7xReXul0Arrpf3eo',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'kristy.pierce@helloencore.com';

-- Tiffany Hoffine - AquantUs
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQHrM5AeGPYc0w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1703081307881?e=1762992000&v=beta&t=ow0eZX7mSoSosvmX124h3viR6jc8qfgPZVZRAOVVlLw',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'tiffany@aquantusllc.com';

-- Chad Heinrich - Acro Service Corp
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQGpI-9ukjgQzQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1701721443720?e=1762992000&v=beta&t=BADjAWR1b4usVNpUPISL-XyIfZoEheHB1i011IM98tc',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'cheinrich@acrocorp.com';

-- Robin Mee - MeeDerby
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQE5IjRsShiP_A/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1536845650279?e=1762992000&v=beta&t=aKCiqPeK9kogO1fA-iyQZAGbTt6gXAs_kXDxlTw3oME',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'robin@meederby.com';

-- Dainiz Alvarez - Arch Staffing & Consulting
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQG3SCeLpIIeJw/profile-displayphoto-scale_400_400/B4EZjCEc2aGcAk-/0/1755602605952?e=1762992000&v=beta&t=U8kEjnb9ia2EMaR52OS86ea5eUtG3y4uIz67LJWM4UU',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'Dainiz.alvarez@archstaffing.us';

-- Robin Sanders - Impellam Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4D03AQFQPOYjYs5Xow/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1658802384877?e=1762992000&v=beta&t=KUzTI13ExzWIt2WSVS7FSQVrfkjGkHWzjf1xiG-vimE',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'robin.sanders@guidantglobal.com';

-- Jennie Taylor - NW Staffing Resources
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C5603AQHd0iXI_kqayA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1517723353165?e=1762992000&v=beta&t=HT5sdycEoP0GkZ9NTv7aTAR_9oPwCaLUXIsWwEMS2go',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jtaylor@nwstaffing.com';

-- Cameron Edwards - Matlen Silver
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFE1K8ZGv7NFw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1684355647640?e=1762992000&v=beta&t=MeHS_f_2rQBhmyl2WFE-3rdRF1dQ8C1wpnMugDB6B1w',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'cedwards@matlensilver.com';

-- Chuck Weiler - Tential Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C5103AQHzDRPSSLa_qA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516291173065?e=1762992000&v=beta&t=yZ7KZ-zp7aGDKn3G0BPQHfqxfYQ-6BP258lmM0rPmHE',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'cweiler@tential.com';

-- Ryan Mcmahon - Lorien
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHgR4MeCSyJHg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1699474576144?e=1762992000&v=beta&t=Wa9Xcc9gQOAzO44CgYkwJ4b66suPLuIKCnmsEhikCyc',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'ryan.mcmahon@lorienglobal.com';

-- Anthony Theodoros - The Theodoros Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFYMSHmrl9DyA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1719937804282?e=1762992000&v=beta&t=RQteILRGT6-KwZaM0ZU4dHTywDep7VNi5P-RJ3uRAMs',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'anthonyt@ttgway.com';

-- Scott Haines - Matlen Silver
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFfoe11hmtzqw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1669746568165?e=1762992000&v=beta&t=_iTVeDCQeZCOp9cv4jQJ5i5c8_x-ksExpo7o3EF_Jlo',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'shaines@matlensilver.com';

-- Joey Barian - Extension
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQFfsOd_MSzYtw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1635783828301?e=1762992000&v=beta&t=QVtJ_kKU9t3znN51fHLhT2H1-DvQUOf5EdL3_OM_kEA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'joey@extensionrecruiting.com';

-- Nicole Pawczuk - Blue Chip Talent
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQEp1ckXY1vCEw/profile-displayphoto-shrink_400_400/B4EZTicAvHG0Ao-/0/1738965783202?e=1762992000&v=beta&t=2aPvN3nC-z7wC4nchQaaFu1G5v95QQk0rry5Z5z0eMo',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'nicolep@bctalent.com';

-- Rich Pennock - Technology Resource Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHmL06vUmKICw/profile-displayphoto-scale_400_400/B56ZoCwAX7KIAk-/0/1760982730711?e=1762992000&v=beta&t=dvKy0UbVIzv4cUIgKgSpHvupPUpVyPZ8rynxXTiaX_4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rpennock@techrg.com';

-- Brian Salkowski - Impellam Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4D03AQFSf9hCIV9RAQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516242665596?e=1762992000&v=beta&t=f4q9bJqsccE7g36q4XPahyYMMqab1fYo7NwFBkDiDxE',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'brian.salkowski@impellam.com';

-- Prabuddha Mohanty - TekWissen
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4D03AQHoxcAc0u69vA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1606854025851?e=1762992000&v=beta&t=RBnnO11lzrVA3aUkNWrJVw8Ifojv_O7_gf8VlAQHh-o',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'prabuddha.m@tekwissen.com';

-- Brad Dobberfuhl - Doximity
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFrQGJ7krDlVg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1721314536826?e=1762992000&v=beta&t=XdOqo_TYiEnTlTwGOsKwNTNqjey7aWLvbHzhqmAp764',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'bdobberfuhl@doximity.com';

-- Kara Rogan - CoWorx Staffing Services
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFRIwYMEC7CjQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1727111574707?e=1762992000&v=beta&t=vnUO87lZAGOEV2Pl8dTTXTLQfPRtQaBQIwjypsncbBA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'kara.rogan@coworxstaffing.com';

-- Jason Effinger - SASR Workforce Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQHxRUqFEz6QnQ/profile-displayphoto-scale_400_400/B4EZnd4yxtGoAk-/0/1760364280770?e=1762992000&v=beta&t=v-WFrb6LcI53W9_xCZQsvWFbTUOezVioFKPaA7KzMSE',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jeffinger@sasrlink.com';

-- Sean Trimble - Acro Service Corporation
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFRkS7-mcptbg/profile-displayphoto-scale_400_400/B56ZhO_EdNHMAg-/0/1753671813513?e=1762992000&v=beta&t=qj4u9jgJHDHoTKa3s9pTpeoUezfPAL-clGx9NUow7Ys',
    updated_at = NOW()
WHERE type = 'person' AND person_email = '';

-- Kate Rutherford - Advanced Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQFyQCPPOMANZw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517758358939?e=1762992000&v=beta&t=shyZxJRQiVS9dLfi8tcrPLlh4ju1v463_hLkE0w80zA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'krutherford@advancedgroup.com';

-- Shubhi Garg - SystemDomain
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQGduieH_i3I_g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1611245890976?e=1762992000&v=beta&t=Mzxhf6WnuX-WWSef4KvQiRDDB8IZqazbrO9seBD5OVc',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'sgarg@systemdomaininc.com';

-- Saskia Greiner - Randstad Digital
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4D03AQHC2BYvmPwuKA/profile-displayphoto-shrink_400_400/B4DZUDpkCnHYAg-/0/1739522982724?e=1762992000&v=beta&t=mXlKeS0zGE3YHnQrD5bvg1fh1WiV2yQqBAQVNMVdXSI',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'saskia.greiner@randstaddigital.com';

-- Jennifer Bartley - Matlen Silver
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFsuVdmACaLPg/profile-displayphoto-shrink_400_400/B4EZU6qVWvGYAg-/0/1740445935128?e=1762992000&v=beta&t=fq_Zpi77pnNd9PeGLHAnyUoLZLEpmp8V9t_1JvfwyN0',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jbartley@matlensilver.com';

-- Benjamin Bonnell - Morgan Benjamin Search Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQGil7UPhXE9QQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1699289423579?e=1762992000&v=beta&t=2vpOloetKR-LGlqToFilrO6uLUbWg6dJmJQcMMTN8F8',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'bb@morganbenjamingroup.com';

-- Benny Joseph - TekWissen
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEsYLQX1FLMsQ/profile-displayphoto-scale_400_400/B56ZmBjc2NG0Ag-/0/1758815182565?e=1762992000&v=beta&t=aDA49bsCj50q2x9RFUZzjXs-GSBqdkLnfrAf75njq5s',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'benny.j@tekwissen.com';

-- Peterson Andrade - Rocksolid Personalvermittlung
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E35AQF_vGWwrL7JCQ/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1730832780235?e=1761728400&v=beta&t=vwQLE9caqEatmXDnMHTIlyaJYQLNbx-cfoufLYDwoF4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'andrade@rocksolid-personal.de';

-- Bill Kasko - Frontline Source Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQF3ghIIKWruDg/profile-displayphoto-shrink_400_400/B56ZSZcsnAHEAg-/0/1737741225338?e=1762992000&v=beta&t=CQGMNi50Cw3g0AlUnXQvFA93hKWPFLYJSyTjGsusrKY',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'bill.kasko@frtline.com';

-- Joseph Ware - Helion Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFgLHBAPch9Eg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1696396164457?e=1762992000&v=beta&t=XO0Geeu9CF7Rd8_0JZufaHAsSiBfcvUq1c3SrHPi_6Q',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'j.ware@heliongrp.com';

-- Andrey Kudievskiy - Distillery
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHJ7c7plhwTDQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1726845892801?e=1762992000&v=beta&t=dXF0CtX6HNStfHJUQAOM72eAaOPNCstYDXdiwmrVu0Y',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'andrey@distillery.com';

-- Glenn Hoogerwerf - Wimmer Solutions Corporation
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQH1QAgicN-mmQ/profile-displayphoto-shrink_400_400/B56ZOYG5LPGkAg-/0/1733423764843?e=1762992000&v=beta&t=IcKdVKElbFRt_AdKyoL146R4hcn9ydl33Butow-1Wls',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'glenn@wimmersolutions.com';

-- Daniel Sullivan - JPatrick
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E35AQFwFcv6Z_9MBA/profile-framedphoto-shrink_400_400/profile-framedphoto-shrink_400_400/0/1663272390762?e=1761728400&v=beta&t=_Io5pwCktFiWpMEqU41Bu666qzXouxsgnhpPDOfTU5k',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'dan@jpatrick.com';

-- Update company nominees (logos) by company name
-- Match by company name and update logo_url

-- eTeam
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D560BAQHIX6ke6qNgVg/company-logo_200_200/company-logo_200_200/0/1719820690492/eteam_logo?e=1762992000&v=beta&t=Gz1TvU_57WOiI0C3XgDcMSPR5bBJkoWEdA-wgBYmPNM',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%eTeam%' OR company_name ILIKE '%eteam%');

-- TekWissen
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D4E0BAQGi0JFr3ZNUqQ/company-logo_200_200/company-logo_200_200/0/1719838772435/tekwissen_logo?e=1762992000&v=beta&t=QAzlVnh-8OShTPdFPk4ROAB0dFV52FCHUXnSZEovnBU',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%TekWissen%' OR company_name ILIKE '%tekwissen%');

-- Travel Nurses
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D4E0BAQF8s6YhlPlhUA/company-logo_200_200/company-logo_200_200/0/1706017815173/travel_nurses_inc_logo?e=1762992000&v=beta&t=HXeKnl0OCttAI4oMfzrceeCwNj-vwcqFO9WKRVl2GRg',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Travel Nurses%' OR company_name ILIKE '%travel nurses%');

-- Impellam Group
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D4E0BAQG6SvFIh1x8UQ/company-logo_200_200/company-logo_200_200/0/1719827465349/impellamgroup_logo?e=1762992000&v=beta&t=UOzqLOwIj7b7QIcc4CkuZCe5maOYTubs1NmZCflOR-Q',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Impellam%' OR company_name ILIKE '%impellam%');

-- Horizontal
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D560BAQFM_CttJdNzEA/company-logo_200_200/company-logo_200_200/0/1720644447675/horizontal_talent_logo?e=1762992000&v=beta&t=qfOG4ZDQsNjKtqfZZAUEXqY9I3-OVsXBPjUTvNnieTQ',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Horizontal%' OR company_name ILIKE '%horizontal%');

-- Spherion
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/C4E0BAQFkUsdOlJ-yXQ/company-logo_200_200/company-logo_200_200/0/1636746605356/spherion_logo?e=1762992000&v=beta&t=C3IYLDgkJ3Izh5bAJAtNzZLz7HnfOEdYkDsvHGF1h50',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Spherion%' OR company_name ILIKE '%spherion%');

-- IDR
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D560BAQHpu2gLxz2S0Q/company-logo_200_200/company-logo_200_200/0/1688151992962/idrinc_logo?e=1762992000&v=beta&t=eDwJV5zaO1_h9JQPoUvdgMXnWbmrEcIkRCtxxicODkQ',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%IDR%' OR company_name ILIKE '%idr%');

-- Mitchell Martin
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D4E0BAQE10HSS2aQUag/company-logo_200_200/B4EZm7IHF.GcAI-/0/1759781090529/mitchell_martin_logo?e=1762992000&v=beta&t=ho1QhpIscsqJ297fWQnQAIX1lHlTOLJWDJZV1TiX0e8',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Mitchell Martin%' OR company_name ILIKE '%mitchell martin%');

-- Matlen Silver
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/C560BAQHQ7dB4QLgg6w/company-logo_200_200/company-logo_200_200/0/1630641121255/matlen_silver_logo?e=1762992000&v=beta&t=HMFK_tzVr5AKOXt_5ztmnH2rJrHNkE-T6TR87zRe5nM',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Matlen Silver%' OR company_name ILIKE '%matlen silver%');

-- BCforward
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D560BAQF-58cvJAABug/company-logo_200_200/company-logo_200_200/0/1708016840492/bcforward_logo?e=1762992000&v=beta&t=Dbfg3ag4cG-0drIIBqYnAs2_oTrK7unSktDM1FvcUK8',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%BCforward%' OR company_name ILIKE '%bcforward%');

-- TalentBurst
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D560BAQH7m2F4U2QHgA/company-logo_200_200/company-logo_200_200/0/1708538368421/talentburst_logo?e=1762992000&v=beta&t=gO61e80yKB4xx3uRRXYfZ8_4snYIXS0D-0v9q6Ctyz8',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%TalentBurst%' OR company_name ILIKE '%talentburst%');

-- WorldWide HealthStaff
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D4E0BAQG1KAoGsgaHvQ/company-logo_200_200/B4EZUEoMomHUAI-/0/1739539401613/worldwidehealthstaff_logo?e=1762992000&v=beta&t=3Oe8z9CPzMfFXB_ydeTzXOHoxGeDfog63aosw2HpRGo',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%WorldWide HealthStaff%' OR company_name ILIKE '%worldwide healthstaff%' OR company_name ILIKE '%healthstaff%');

-- SURESTAFF
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D560BAQETqUGLSKISAw/company-logo_200_200/company-logo_200_200/0/1732141498949/surestaffinc_logo?e=1762992000&v=beta&t=AVGwJNC0fsJDNsLH1hBAWCW4UXqCxHNLf_yJTPzvIsY',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%SURESTAFF%' OR company_name ILIKE '%surestaff%');

-- KP Staffing
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/C560BAQH2uyqvW5LkRw/company-logo_200_200/company-logo_200_200/0/1655145771145/kpstaffing_logo?e=1762992000&v=beta&t=teX9LXPR4QnQ8b0jDC1j3rTlb7PRbW8xk3XWT1S5f7E',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%KP Staffing%' OR company_name ILIKE '%kp staffing%');

-- Carlton National
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D4E0BAQHlfl1mwxsAHA/company-logo_200_200/company-logo_200_200/0/1722977288471/carltonnationalresources_logo?e=1762992000&v=beta&t=MmXBmv3d0wBP2NEjySKqNFSpBy1FWE8gPHEH8K-3D_E',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Carlton National%' OR company_name ILIKE '%carlton national%');

-- CoWorx Staffing Services
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D4E0BAQF8Ux-v5AQrHA/company-logo_200_200/company-logo_200_200/0/1734989595847/coworx_staffing_services_logo?e=1762992000&v=beta&t=Qfn2tP_htMbDaYuX-LqYHrF3UQeg46i9_5n2-FRDz40',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%CoWorx%' OR company_name ILIKE '%coworx%');

-- 20four7VA
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/C4D0BAQHpA8N_TxKAeQ/company-logo_200_200/company-logo_200_200/0/1630579176017/20four7va_logo?e=1762992000&v=beta&t=kbT-WEBxCTnfUFsUoXNkIhFshLFd-G9xIoL0zVKncQE',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%20four7VA%' OR company_name ILIKE '%20four7va%');

-- Onward Search
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D4E0BAQFmgd07x1gnjQ/company-logo_200_200/B4EZfGdWqQHgAI-/0/1751381273575/onward_search_logo?e=1762992000&v=beta&t=aDBVIByiRoN01EvTUSROUoHF5DIpLOeZdrVaWiKKCbs',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Onward Search%' OR company_name ILIKE '%onward search%');

-- Peoplelink Group
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/C560BAQG3kFQTK2XEMA/company-logo_200_200/company-logo_200_200/0/1655852676125/peoplelink_group_logo?e=1762992000&v=beta&t=VMWBhZvFYaC5OAPGYm4a8Pg20NPi1TkOcPbKATW2zug',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Peoplelink%' OR company_name ILIKE '%peoplelink%');

-- APC
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D4D0BAQGeHgzitKET7g/company-logo_200_200/company-logo_200_200/0/1704297756574/apcjobs_logo?e=1762992000&v=beta&t=ZdyMCMyaYjRSTmc95Q5tmv-M5p-LyKutg2RiIivaolM',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%APC%' OR company_name ILIKE '%apc%');

-- Bartech Staffing
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/D560BAQHFlD5YRNf2Xg/company-logo_200_200/company-logo_200_200/0/1721149893123/bartech_staffing_logo?e=1762992000&v=beta&t=YyWyWcB56sMijHMZ_O6zRDTaLihz3vmIk6GKIsp36fQ',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Bartech%' OR company_name ILIKE '%bartech%');

-- Adecco
UPDATE public.nominees 
SET logo_url = 'https://media.licdn.com/dms/image/v2/C510BAQEeK1BH5vKw8Q/company-logo_200_200/company-logo_200_200/0/1631346849445?e=1762992000&v=beta&t=YWBk9lvEYBiD0U6pB8S_zmIIFPQtj60UmJxkKdu_vH0',
    updated_at = NOW()
WHERE type = 'company' AND (company_name ILIKE '%Adecco%' OR company_name ILIKE '%adecco%');

-- Show summary of updates
SELECT 
  'Person nominees with images' as category,
  COUNT(*) as count
FROM public.nominees 
WHERE type = 'person' AND headshot_url IS NOT NULL AND headshot_url != ''

UNION ALL

SELECT 
  'Company nominees with logos' as category,
  COUNT(*) as count
FROM public.nominees 
WHERE type = 'company' AND logo_url IS NOT NULL AND logo_url != ''

UNION ALL

SELECT 
  'Total nominees' as category,
  COUNT(*) as count
FROM public.nominees;

-- Show some examples of updated nominees
SELECT 
  type,
  CASE 
    WHEN type = 'person' THEN firstname || ' ' || lastname
    ELSE company_name
  END as name,
  CASE 
    WHEN type = 'person' THEN headshot_url
    ELSE logo_url
  END as image_url,
  CASE 
    WHEN type = 'person' AND headshot_url IS NOT NULL AND headshot_url != '' THEN '✅ Has image'
    WHEN type = 'company' AND logo_url IS NOT NULL AND logo_url != '' THEN '✅ Has logo'
    ELSE '❌ No image'
  END as status
FROM public.nominees 
WHERE (type = 'person' AND headshot_url IS NOT NULL AND headshot_url != '') 
   OR (type = 'company' AND logo_url IS NOT NULL AND logo_url != '')
ORDER BY type, name
LIMIT 10;