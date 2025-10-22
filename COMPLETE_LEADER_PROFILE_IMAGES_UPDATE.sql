-- COMPLETE Leader Profile Images Update SQL Script
-- This script updates profile images for ALL 47 leaders from the comprehensive JSON data
-- Match by email address and update headshot_url for person nominees

-- ===== PERSON NOMINEES PROFILE IMAGE UPDATES =====

-- 1. Ranjit Nair - eTeam
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQHzClKhhF8Zxg/profile-displayphoto-shrink_400_400/B4EZimjCj6GcAk-/0/1755140864736?e=1762992000&v=beta&t=fg15C-1qWKk1XyI_Ox-NcDX6oW2jXXSM9U6WDBfMGUI',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rnair@eteaminc.com';

-- 2. Corey Michaels - Adecco
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQEbP_bsdvNGrg/profile-displayphoto-shrink_400_400/B4EZQs_VULHEAg-/0/1735921588195?e=1762992000&v=beta&t=uPUc4ttI7Z3eI1yc03Tme-tlKQsjMo9F5iObV8mzj8w',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'corey.michaels@adeccona.com';

-- 3. Michelle Davis - Travel Nurses
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQFB2565Glpwuw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517714039673?e=1762992000&v=beta&t=JG0Ur72But7zFcEws_MeQ9Xq3iyDBkY1SWTnbYKb5WA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'michelled@travelnursesinc.com';

-- 4. Venkat Swaroop - TekWissen Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4D03AQFwuQMyMMCb7Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1725634816217?e=1762992000&v=beta&t=LnDJHWWFevWFZ5NXtBM56MRCo55aUKfLxVDZPuJMNGs',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'venkat@tekwissen.com';

-- 5. Matt Munoz - CompuStaff
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEgQqsLlGOhzg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1685741191248?e=1762992000&v=beta&t=8DD6nTOW4StjzlN56WdEP3YZtkQmuhgBF7A4xJWStuU',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'mmunoz@compustaff.com';

-- 6. Jeff Seebinger - Horizontal
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQGhXI4nvfB6FQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1691032752083?e=1762992000&v=beta&t=7RgYKKgKuD6cHbh9fXuINgEszUvwHlvtJIK2sIOhEC0',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jseebinger@horizontalintegration.com';

-- 7. Lynn Billing - Spherion Staffing Services
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQGz-wszaY1BlA/profile-displayphoto-shrink_400_400/B56ZeITupdH8Ak-/0/1750338563175?e=1762992000&v=beta&t=pEiyVDg679cCfSNtPn6sHFDvT5By7FT23MSnkGQvNxY',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'lynnbilling@spherion.com';

-- 8. Jeremy Langevin - Horizontal Talent
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFBgAZPSXMZFA/profile-displayphoto-shrink_400_400/B4EZWCAU09HMAs-/0/1741642878538?e=1762992000&v=beta&t=eteypWAPdFS6M53EPGvG0Uxf5aEyEjbLzmKNaFVUuU4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jlangevin@horizontal.com';

-- 9. Justin Christian - BCforward
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQHry6wHEX2ZFw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1543945656128?e=1762992000&v=beta&t=8PZZCe8Fv_DBCM_F-M3H3wWRH4bVdwwc6fodxFcw6fw',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'justin.christian@bcforward.com';

-- 10. Ashley Holahan - IDR
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQELw88pkji_ow/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1713527926306?e=1762992000&v=beta&t=L9zBJYAB3TdB_AAZKrvdOniHP3G2i-1GFeerh_HHW3Y',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'aholahan@idr-inc.com';

-- 11. Namrata Anand - TalentBurst
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQGFel9C8R90UQ/profile-displayphoto-shrink_400_400/B4EZR02zXKGgAs-/0/1737127311196?e=1762992000&v=beta&t=nggVG1GRQuGQaCE4zUDxHx-J7NjJVso6FBlbJJmzPmQ',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'namrata.anand@talentburst.com';

-- 12. Rajanish Pandey - TekWissen
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHBLnlDJAV4KA/profile-displayphoto-shrink_400_400/B56ZYOdt_nHEAg-/0/1743999394378?e=1762992000&v=beta&t=aVjZQnMj5YjtzF5aix6e9rY3DiF-VooHfmtws2O3hEI',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rajanish.p@tekwissen.com';

-- 13. Marcus Napier - Crown Staffing
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQG0Gp6xq1lVyw/profile-displayphoto-shrink_800_800/B56ZTm83QTHEAc-/0/1739041502600?e=1762992000&v=beta&t=fWHkhPEUoTjELDm8a9A_mFqODiAVXVn19KC84D-nONA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'Marcus@crownstaffing.com';

-- 14. Ron Hoppe - WorldWide HealthStaff Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4D03AQFer1wrsu943w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1732216578524?e=1762992000&v=beta&t=DNroVlnfNmO-UwTsrKfZGfXE8jQmhP1jS-nLM6FHvy4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rhoppe@healthstaff.org';

-- 15. Amanda Platia - CoWorx Staffing Services
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQG_nQx77B_6kQ/profile-displayphoto-shrink_400_400/B4EZThzDNBG0Ag-/0/1738955044787?e=1762992000&v=beta&t=-52Yt8choVM-_YsnzcSnwKQBUcG0OQCKGk33MV8ci44',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'amanda.platia@coworxstaffing.com';

-- 16. Lisa Jock - Spherion
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFUispFAx-EWg/profile-displayphoto-shrink_400_400/B4EZXJP0pZHgAk-/0/1742838123556?e=1762992000&v=beta&t=H3E6OGnOn3wwLnD23kIO1OyLWAZatBKNCQXDQCj5WIg',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'lisajock@spherion.com';

-- 17. Robert Brown - Carlton National
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFbjmxwFXNfsQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1676994696156?e=1762992000&v=beta&t=LDJBRKu8hWnCy1nhFsmZbUv17Egak1qhNrHMU61VBAw',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rbrown@carltonnational.com';

-- 18. Anna Burton - IDR
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFeaJl-HGSuIg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1731629559565?e=1762992000&v=beta&t=w0yp9VF8WPwc5_WoJ4vFppi9Omp-K31O5KpRvmsxORo',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'aburton@idr-inc.com';

-- 19. Susan Dutcher - Bartech Staffing
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQG0OFQ6nO6ddg/profile-displayphoto-scale_400_400/B56ZmI4pt5I0Ag-/0/1758938176854?e=1762992000&v=beta&t=vVSRJao7Kx30JZ72wSMplvCmFRuQwF19UAerkZiKnlg',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'sdutcher@bartechgroup.com';

-- 20. Nathan Doran - KP Staffing
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHHrYAefdOxTw/profile-displayphoto-shrink_400_400/B56ZbUcbRRHUAs-/0/1747320946419?e=1762992000&v=beta&t=idwWj0oqvKrTFknI40ZCJWRh2EnjaMgZec41rfnvtVM',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'nathan@kpstaffing.com';

-- 21. Christine Doran - KP Staffing
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQGaHWcjDcKFUg/profile-displayphoto-scale_400_400/B56Znp8byhG0Ag-/0/1760566558823?e=1762992000&v=beta&t=cr2xqnANuJe3WkmQt0kfGtO4IBP6GLuKnbMf5eKTPuQ',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'christine@kpstaffing.com';

-- 22. Gene Holtzman - Mitchell Martin
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQH3fpQkrn7Ruw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517669637083?e=1762992000&v=beta&t=6YfbD2ZABB1GtpJkPBupzzv0778RMgQKAtH7-FwT1ys',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'gholtzman@itmmi.com';

-- 23. Jamie Jacobs - TalentBurst
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEwfDYAVuh-5A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1726157314534?e=1762992000&v=beta&t=URDiGZqMvvoVfCJVrF4xkP3sb8DiPybmC2vwFC2My_8',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jamie.jacobs@talentburst.com';

-- 24. Jacob Pruis - BCforward
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQH36L-q6Q4gCg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1686257726596?e=1762992000&v=beta&t=LpsN2qDpn9gvX93iUyjlDcL4ivFGDOpTlYdZksQ23zs',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jacob.pruis@bcforward.com';

-- 25. Alfin Gustian Akbar - Adecco
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQF_u2OQC4tK1Q/profile-displayphoto-shrink_400_400/B56Zd9OySbHUAg-/0/1750152718563?e=1762992000&v=beta&t=reRGwa5P9S8JCeEe8Jzxg3jwgUs0FqTJgo77s8hNqak',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'alfin.gustian@adecco.com';

-- 26. Ken Clark - Onward Search
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQFdZjgjSuYrdg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1569275550888?e=1762992000&v=beta&t=wVPXGfUAJSc5gH_crsYXnrbw04NxAMwk3HLSVCefZ5E',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'ken@onwardsearch.com';

-- 27. Sandy Picciola - SURESTAFF
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQH0lP1zGWj4Sg/profile-displayphoto-scale_400_400/B56ZgJMUVuGUAg-/0/1752500881230?e=1762992000&v=beta&t=EY5-fhGhxFJawjDSC5uq7uMO567D2kICz54zautyL6g',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'spicciola@sure-staff.com';

-- 28. Joshua Holtzman - Mitchell Martin
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4D03AQHk5nGIIsqA3g/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516483510750?e=1762992000&v=beta&t=vjdBy0qiXj6YHa1_AHWewHLamPhQS0LBgP3rSwAiubE',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jholtzman@itmmi.com';

-- 29. Rachel Slowey - ElevaIT Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQFcj2ovp_tKUA/profile-displayphoto-scale_400_400/B4EZgQ7wm8GcAk-/0/1752630758831?e=1762992000&v=beta&t=buWT8GCjUE8z-XwoHpJMUEqY16Mw3xFIhVu1Jt9loqU',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rachel.slowey@elevait.tech';

-- 30. Andy Jones - Medix
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C5603AQFDnUVj2GqrCg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1653962735762?e=1762992000&v=beta&t=z53SkwTlWVbXQngNc2o5A5r2rEFE3sFjKh8bm2XUsgA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'ajones@medixteam.com';

-- 31. Lee Boelens - GDH Consulting
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4D03AQE2VZyr91LoLg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1668096206223?e=1762992000&v=beta&t=Bd26sXyEDQH0jNboVe75hJ52w9HfPfrMbPQ9mN-ZzA0',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'lboelens@gdhinc.com';

-- 32. JJ Hurley - GDH Consulting
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C5603AQEvjLzvpazz8Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1668116160826?e=1762992000&v=beta&t=7cYG38Kh2Pt91spn3mktpN0sZkMEBen1KhTuIKSQTXM',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jj@gdhinc.com';

-- 33. Mike Viso - Mitchell Martin
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E03AQE3E6VkxFRu8Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1726450791427?e=1762992000&v=beta&t=Mo1bsI4Acvh4zgYINUOGTyDzWWvRaX52ZA8r0xpI0U4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'mike.viso@itmmi.com';

-- 34. Rebeca Martinez - IDEAL Personnel Services
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/C4E03AQHGKVsJz4OG-g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1612967895209?e=1762992000&v=beta&t=TIUs7NA_mc1Q7Nt_nqoNguS6wfgI3CWjBYezDIUNWeQ',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'rmartinez@ideal-personnel.com';

-- 35. Christophe Jeusse - Peoplelink Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEMA_4aVrEahw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1665088461554?e=1762992000&v=beta&t=qRR6l9bOJ5jrGDLPS0luWffligCQ1SGbrbB6RRrt-Zw',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'christophe.jeusse@peoplelinkgroup.com';

-- 36. Marlinda Friend - NW Staffing Resources
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5635AQFcYmNa7QfaFg/profile-framedphoto-shrink_400_400/B56ZkbMnGKI4Ac-/0/1757097915069?e=1761728400&v=beta&t=z47KFSq89KtxnCgMI46hYktJVeD2jpN4UbjXo2srnZw',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'mfriend@nwstaffing.com';

-- 37. Sai Teja Saragada - TekWissen
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFZj6T8xnr8wA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1728061810205?e=1762992000&v=beta&t=wyetQwWKshTouGAEze4U9HcwddcrrMoMaJZxBDlSQ5k',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'sai.s@tekwissen.com';

-- 38. Alan Craig - QX Global Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D4E35AQHxhQop7Cncpg/profile-framedphoto-shrink_400_400/B4EZntvZ3EGUAc-/0/1760630251183?e=1761728400&v=beta&t=RqR5rhyPQQj8jGU2BpwztOrmBvr-V26mf8BnJY1gb60',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'alandcraig@btinternet.com';

-- 39. Kelly Bathgate - Peoplelink Group
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEa4hOaZ7d_Dg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1708023493219?e=1762992000&v=beta&t=NCK5JwmOkvAbRxuCmAj7pqAc2Lye2ED6RDSbR07jeUA',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'kbathgate@peoplelinkgroup.com';

-- 40. Leah Pelletier - Acro Service Corp
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQHt12SIqVgz3g/profile-displayphoto-shrink_400_400/B56ZdUleC.HUAk-/0/1749470799019?e=1762992000&v=beta&t=JJnEpmQhga8JdcQjFVvberf11Yo4j36LMrmYXC5miqE',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'lpelletier@acrocorp.com';

-- 41. Blaine Caples - GDH Consulting
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQH1Q1wkE9LAHQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1669735723623?e=1762992000&v=beta&t=lO0X3nZqkt3aAPiZLYQK8Ox5tZSM3EoWGRf7vkSDNJU',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'bcaples@gdhinc.com';

-- 42. Damien Howard - Grant Wagner
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQG_dyQlV-auPA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1686019193407?e=1762992000&v=beta&t=_TTEL8AF1NIkz5uurlum6kgdD1S9LMXGjpOzdG4Wmqo',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'damien.howard@grantwagnertalent.com';

-- 43. Denise Stalker - TalentProcure (Note: Email matches Jamie Jacobs)
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFGRvZ4s1lpIw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1694636450296?e=1762992000&v=beta&t=_HbXuljvlFzWW_dKfhMtwbIXlnymMKwksxAkj5LpGTc',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'jamie.jacobs@talentburst.com' AND (firstname = 'Denise' OR lastname = 'Stalker');

-- 44. Kristina Djokic - Acro Service Corp
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQFq88TDJbmW_A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1719325014464?e=1762992000&v=beta&t=8kXSz3TbsWo4GNpwcHTFMbwfsBGR4gpuZx4Q5zwWm98',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'kdjokic@acrocorp.com';

-- 45. Marsha Murray - Murray Resources
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQG9hjHP3a7mAg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1699930997279?e=1762992000&v=beta&t=IbOtbcnKG1d0aXQKR2FgmNiVQps977cxCoU1H8ge_IM',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'mmurray@murrayresources.com';

-- 46. Meron Sheriff - ElevaIT Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQE-DPlNIe6Ubg/profile-displayphoto-shrink_800_800/B56Zbwj8R7G4Ak-/0/1747792677310?e=1762992000&v=beta&t=dlx1KqgtTtLTC0ciidERVYf73cUUMEQg3F9Gy2jRla8',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'meron.sheriff@elevait.tech';

-- 47. Byrne Luft - TAPP Workforce Solutions
UPDATE public.nominees 
SET headshot_url = 'https://media.licdn.com/dms/image/v2/D5603AQEtaBeSKbQBeA/profile-displayphoto-shrink_800_800/B56ZkikYYhHAAc-/0/1757221587155?e=1762992000&v=beta&t=0OAtaSM6PKspG-4EljwCxMSsNHpHUbjXuyONYH82WY4',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'byrne.luft@archstaffing.ca';

-- ===== VERIFICATION AND SUMMARY QUERIES =====

-- Show update summary
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

-- Show examples of updated nominees
SELECT 
  type,
  CASE 
    WHEN type = 'person' THEN firstname || ' ' || lastname
    ELSE company_name
  END as name,
  person_email,
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
LIMIT 20;