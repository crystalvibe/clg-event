interface IDBDatabase {
  transaction(storeName: string, mode: 'readonly' | 'readwrite'): IDBTransaction;
}

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('eventsDB', 3);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      
      // Create events store if it doesn't exist
      if (!db.objectStoreNames.contains('events')) {
        const store = db.createObjectStore('events', { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
      }

      // Create categories store if it doesn't exist
      if (!db.objectStoreNames.contains('categories')) {
        const store = db.createObjectStore('categories', { keyPath: 'name' });
      }

      // Create eventTypes store if it doesn't exist
      if (!db.objectStoreNames.contains('eventTypes')) {
        const store = db.createObjectStore('eventTypes', { keyPath: 'name' });
      }
    };
  });
};

// Add openDB function to fix the 'Cannot find name openDB' error
export const openDB = async (): Promise<IDBDatabase> => {
  return initDB() as Promise<IDBDatabase>;
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const saveEvents = async (events: any[]) => {
  try {
    const db: any = await initDB();
    const tx = db.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    
    // Create a promise that resolves when the transaction completes
    const txComplete = new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });

    // Clear the store first
    await store.clear();
    
    // Process all events and create an array of promises
    const promises = events.map(async (event) => {
      const processedEvent = { ...event };
      
      // Handle media files
      if (event.media && Array.isArray(event.media)) {
        processedEvent.media = event.media.map((media: any) => {
          // If it already has data property, return as is
          if (media.data) {
            return {
              name: media.name,
              type: media.type,
              size: media.size,
              data: media.data
            };
          }
          return null;
        }).filter(Boolean);
      }

      // Add the processed event to the store
      return store.add(processedEvent);
    });

    // Wait for all store operations to complete
    await Promise.all(promises);
    
    // Wait for transaction to complete
    await txComplete;

    return true;
  } catch (error) {
    console.error('SaveEvents failed:', error);
    throw error;
  }
};

export const getEvents = async () => {
  const db: any = await initDB();
  const tx = db.transaction('events', 'readonly');
  const store = tx.objectStore('events');

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      const events = request.result.map((event: any) => {
        if (event.media && Array.isArray(event.media)) {
          event.media = event.media.map((media: any) => {
            if (media.data) {
              // Create blob URL from base64 data
              const blob = dataURLtoBlob(media.data);
              return {
                ...media,
                url: URL.createObjectURL(blob)
              };
            }
            return media;
          });
        }
        return event;
      });
      resolve(events);
    };
    request.onerror = () => reject(request.error);
  });
};

// Helper function to convert base64 data URL to Blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
} 

// Enhanced IndexedDB configuration
const dbConfig = {
  name: 'eventsDB',
  version: 1,
  stores: [{
    name: 'events',
    keyPath: 'id',
    indexes: [
      { name: 'date', keyPath: 'date' },
      { name: 'department', keyPath: 'department' },
      { name: 'category', keyPath: 'category' },
      { name: 'year', keyPath: 'year' }
    ]
  }]
}; 

export const getAllCategories = async (): Promise<string[]> => {
  const db: any = await openDB();
  const transaction = db.transaction('categories', 'readonly');
  const store = transaction.objectStore('categories');
  const categories = await store.getAll();
  return categories.map((cat: { name: string }) => cat.name);
};

export const getAllEventTypes = async (): Promise<string[]> => {
  const db: any = await openDB();
  const transaction = db.transaction('eventTypes', 'readonly');
  const store = transaction.objectStore('eventTypes');
  const types = await store.getAll();
  return types.map((type: { name: string }) => type.name);
};

export const addCategory = async (categoryName: string): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction('categories', 'readwrite');
  const store = transaction.objectStore('categories');
  await store.add({ name: categoryName });
};

export const addEventType = async (typeName: string): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction('eventTypes', 'readwrite');
  const store = transaction.objectStore('eventTypes');
  await store.add({ name: typeName });
}; 