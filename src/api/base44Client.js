const getStorageData = (entity) => {
  const data = localStorage.getItem(`db_${entity}`);
  return data ? JSON.parse(data) : [];
};

const setStorageData = (entity, data) => {
  localStorage.setItem(`db_${entity}`, JSON.stringify(data));
};

const createEntityRepo = (entityName) => {
  return {
    list: async (order, limit) => {
      let data = getStorageData(entityName);
      if (order) {
        const isDesc = order.startsWith('-');
        const key = isDesc ? order.substring(1) : order;
        data.sort((a, b) => {
          let valA = a[key] ?? '';
          let valB = b[key] ?? '';
          if (typeof valA === 'string') return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
          return isDesc ? valB - valA : valA - valB;
        });
      }
      if (limit) data = data.slice(0, limit);
      return data;
    },
    filter: async (query, order, limit) => {
      let data = getStorageData(entityName);
      if (query && typeof query === 'object') {
        data = data.filter(item => {
          return Object.entries(query).every(([k, v]) => item[k] === v);
        });
      }
      if (order) {
        const isDesc = order.startsWith('-');
        const key = isDesc ? order.substring(1) : order;
        data.sort((a, b) => {
          let valA = a[key] ?? '';
          let valB = b[key] ?? '';
          if (typeof valA === 'string') return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
          return isDesc ? valB - valA : valA - valB;
        });
      }
      if (limit) data = data.slice(0, limit);
      return data;
    },
    create: async (item) => {
      const data = getStorageData(entityName);
      const newItem = { 
        id: entityName.toLowerCase() + '_' + Math.random().toString(36).substr(2, 9),
        created_date: new Date().toISOString(),
        ...item 
      };
      data.push(newItem);
      setStorageData(entityName, data);
      return newItem;
    },
    update: async (id, updates) => {
      const data = getStorageData(entityName);
      let updatedItem = null;
      const updatedData = data.map(item => {
        if (item.id === id) {
          updatedItem = { ...item, ...updates };
          return updatedItem;
        }
        return item;
      });
      setStorageData(entityName, updatedData);
      return updatedItem;
    },
    delete: async (id) => {
      const data = getStorageData(entityName);
      const filtered = data.filter(item => item.id !== id);
      setStorageData(entityName, filtered);
      return { success: true };
    },
    bulkCreate: async (items) => {
      const data = getStorageData(entityName);
      const newItems = items.map(item => ({
        id: entityName.toLowerCase() + '_' + Math.random().toString(36).substr(2, 9),
        created_date: new Date().toISOString(),
        ...item
      }));
      const combined = [...data, ...newItems];
      setStorageData(entityName, combined);
      return newItems;
    }
  };
};

export const base44 = {
  entities: {
    BlogPost: createEntityRepo('BlogPost'),
    Feature: createEntityRepo('Feature'),
    Language: createEntityRepo('Language'),
    Lead: createEntityRepo('Lead'),
    Location: createEntityRepo('Location'),
    Package: createEntityRepo('Package'),
    Project: createEntityRepo('Project'),
    Property: createEntityRepo('Property'),
    PropertyType: createEntityRepo('PropertyType'),
    SiteSettings: createEntityRepo('SiteSettings'),
    User: createEntityRepo('User')
  },
  auth: {
    me: async () => ({ id: "admin-1", full_name: "Emlak Yöneticisi", email: "admin@emlaksitesi.com", role: "admin" }),
    logout: () => {},
    redirectToLogin: () => {}
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const url = URL.createObjectURL(file);
        return { file_url: url };
      },
      InvokeLLM: async ({ prompt }) => {
        console.log("Lokal yapay zeka:", prompt);
        return {
          seo_title: "Luxury Real Estate for Sale in Turkey | Modern Project",
          seo_description: "Discover exclusive luxury apartments and properties for sale in Turkey. Great investment opportunity.",
          slug: "luxury-modern-property-for-sale-turkey",
          seo_keywords: "turkey property, investment turkey, buy apartment",
          title: "Premium Modern Residence Project",
          description: "<p>This exclusive real estate project offers state-of-the-art architecture combined with excellent location advantages in Turkey.</p><p>Equipped with absolute luxury amenities including private swimming pools, high-end fitness facilities, and security.</p>"
        };
      }
    }
  }
};