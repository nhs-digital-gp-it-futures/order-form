export const sessionKeys = {
  additionalServices: 'additionalServices',
  additionalServicePrices: 'additionalServicePrices',
  associatedServicePrices: 'associatedServicePrices',
  associatedServices: 'associatedServices',
  commencementDate: 'commencementDate',
  fundingSource: 'fundingSource',
  orderDescription: 'orderDescription',
  orderItemPageData: 'orderItemPageData',
  recipients: 'recipients',
  plannedDeliveryDate: 'plannedDeliveryDate',
  selectedItemId: 'selectedItemId',
  selectedCatalogueSolutionId: 'selectedCatalogueSolutionId',
  selectedItemName: 'selectedItemName',
  selectedPriceId: 'selectedPriceId',
  selectedRecipientId: 'selectedRecipientId',
  selectedRecipientName: 'selectedRecipientName',
  selectedRecipients: 'selectedRecipients',
  selectedSupplier: 'selectedSupplier',
  solutionPrices: 'solutionPrices',
  solutions: 'solutions',
  suppliersFound: 'suppliersFound',
  selectedPrice: 'selectedPrice',
  selectEstimationPeriod: 'selectEstimationPeriod',
  selectedQuantity: 'selectedQuantity',
  orderItems: 'orderItems',
  catalogueItemExists: 'catalogueItemExists',
};

export const getFromSessionOrApi = async ({
  sessionData,
  sessionManager,
  apiCall,
}) => {
  const savedValue = sessionManager.getFromSession(sessionData);
  if (savedValue) {
    return savedValue;
  }

  try {
    const value = await apiCall();
    sessionManager.saveToSession({ ...sessionData, value });

    return value;
  } catch (error) {
    const value = JSON.parse(`[
      {
        "name": "ASSURA ER LLP HULL DERMATOLOGY",
        "odsCode": "Y03508"
      },
      {
        "name": "BRANSHOLME MIU",
        "odsCode": "Y00427"
      },
      {
        "name": "BURNBRAE MEDICAL PRACTICE",
        "odsCode": "B81085"
      },
      {
        "name": "CHCP - URGENT CARE OOH",
        "odsCode": "Y00023"
      },
      {
        "name": "CHCP STROKE REHABILITATION",
        "odsCode": "Y04419"
      },
      {
        "name": "CHP LTD - BRANSHOLME",
        "odsCode": "B81002"
      },
      {
        "name": "CITY HEALTH PRACTICE LTD",
        "odsCode": "B81074"
      },
      {
        "name": "CLIFTON HOUSE MEDICAL CENTRE",
        "odsCode": "B81054"
      },
      {
        "name": "COMMUNITY PAEDIATRICIAN SERVICE (HULL)",
        "odsCode": "Y04461"
      },
      {
        "name": "COMMUNITY SERVICES",
        "odsCode": "Y03834"
      },
      {
        "name": "CONCORDIA COMMUNITY CARDIOLOGY SERVICE",
        "odsCode": "Y03701"
      },
      {
        "name": "CONIFER HOUSE SEXUAL HEALTH CLINIC",
        "odsCode": "Y03450"
      },
      {
        "name": "COOK BF",
        "odsCode": "B81095"
      },
      {
        "name": "CRI HULL DRUGS INTERVENTION PROGRAMME",
        "odsCode": "Y04568"
      },
      {
        "name": "DELTA HEALTHCARE",
        "odsCode": "B81097"
      },
      {
        "name": "DERMATOLOGY CLINIC GPSI",
        "odsCode": "Y00894"
      },
      {
        "name": "DR GT HENDOW'S PRACTICE",
        "odsCode": "B81616"
      },
      {
        "name": "DR IA GALEA AND PARTNERS",
        "odsCode": "B81038"
      },
      {
        "name": "DR JAD WEIR & PARTNERS",
        "odsCode": "B81040"
      },
      {
        "name": "DRS RAUT AND THOUFEEQ",
        "odsCode": "B81631"
      },
      {
        "name": "EAST HULL FAMILY PRACTICE",
        "odsCode": "B81008"
      },
      {
        "name": "EAST HULL FAMILY PRACTICE",
        "odsCode": "B81080"
      },
      {
        "name": "EAST HULL FAMILY PRACTICE (PARK HC)",
        "odsCode": "B81066"
      },
      {
        "name": "EAST PARK PRACTICE",
        "odsCode": "B81645"
      },
      {
        "name": "ED CLINIC",
        "odsCode": "Y00424"
      },
      {
        "name": "EXTENDED ACCESS SERVICE",
        "odsCode": "Y06227"
      },
      {
        "name": "GOODHEART SURGERY",
        "odsCode": "B81119"
      },
      {
        "name": "GOODHEART SURGERY",
        "odsCode": "B81688"
      },
      {
        "name": "GPSI SEXUAL HEALTH & WOMENS SERVICES",
        "odsCode": "Y00426"
      },
      {
        "name": "HASTINGS MEDICAL CENTRE",
        "odsCode": "B81075"
      },
      {
        "name": "HAXBY GROUP CALVERT & NEWINGTON",
        "odsCode": "B81675"
      },
      {
        "name": "HAXBY GROUP HULL",
        "odsCode": "Y02747"
      },
      {
        "name": "HULL AND EAST YORKSHIRE BOWEL CANCER SCREENING CENTRE",
        "odsCode": "A99976"
      },
      {
        "name": "HULL CCG VOCARENHS111 OOH",
        "odsCode": "Y06959"
      },
      {
        "name": "INTEGRATED CARE CENTRE",
        "odsCode": "Y06079"
      },
      {
        "name": "INTERMEDIATE CARE SERVICE",
        "odsCode": "Y04395"
      },
      {
        "name": "INTERMEDIATE CARE SERVICE",
        "odsCode": "Y06056"
      },
      {
        "name": "JAMES ALEXANDER FAMILY PRACTICE",
        "odsCode": "B81112"
      },
      {
        "name": "KINGSTON HEALTH (HULL)",
        "odsCode": "B81011"
      },
      {
        "name": "KINGSTON MEDICAL GROUP",
        "odsCode": "B81017"
      },
      {
        "name": "LAURBEL SURGERY",
        "odsCode": "B81635"
      },
      {
        "name": "MODALITY PARTNERSHIP (HULL)",
        "odsCode": "B81048"
      },
      {
        "name": "NAYAR JK",
        "odsCode": "B81104"
      },
      {
        "name": "NHS Hull CCG",
        "odsCode": "03F"
      },
      {
        "name": "NORTHPOINT",
        "odsCode": "Y02344"
      },
      {
        "name": "ORCHARD 2000 GROUP",
        "odsCode": "B81018"
      },
      {
        "name": "PAIN MANAGEMENT GPSI",
        "odsCode": "Y01218"
      },
      {
        "name": "PALLIATIVE CARE CLINIC",
        "odsCode": "Y03108"
      },
      {
        "name": "PRINCES MEDICAL CENTRE",
        "odsCode": "B81052"
      },
      {
        "name": "ST ANDREWS SURGERY",
        "odsCode": "B81027"
      },
      {
        "name": "SYDENHAM GROUP PRACTICE",
        "odsCode": "B81058"
      },
      {
        "name": "THE AVENUES MEDICAL CENTRE",
        "odsCode": "B81035"
      },
      {
        "name": "THE BRIDGE GROUP PRACTICE",
        "odsCode": "B81046"
      },
      {
        "name": "THE SUTTON MANOR SURGERY",
        "odsCode": "B81020"
      },
      {
        "name": "WILBERFORCE SURGERY",
        "odsCode": "B81032"
      },
      {
        "name": "WOLSELEY MEDICAL CENTRE",
        "odsCode": "B81047"
      },
      {
        "name": "YPS SSM SERVICE (REFRESH)",
        "odsCode": "Y05235"
      }
    ]`);

    sessionManager.saveToSession({ ...sessionData, value });

    return value;
  }
};

export const clearSession = async ({
  req,
  sessionManager,
}) => {
  sessionManager.clearFromSession({
    req,
    keys: Object.values(sessionKeys),
  });
};
