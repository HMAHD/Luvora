// Migration: Create whatsapp_sessions collection for database-backed session storage
//
// This collection stores compressed WhatsApp Web.js session data in the database
// instead of the file system, enabling:
// - Session persistence across deployments
// - Horizontal scaling
// - Reduced storage costs (5-10MB vs 150MB per user)
// - Automatic backups

migrate((db) => {
  const collection = new Collection({
    id: "pbc_whatsapp_sessions",
    name: "whatsapp_sessions",
    type: "base",
    system: false,

    listRule: "@request.auth.id != \"\" && user.id = @request.auth.id",
    viewRule: "@request.auth.id != \"\" && user.id = @request.auth.id",
    createRule: "@request.auth.id = user.id",
    updateRule: "@request.auth.id != \"\" && user.id = @request.auth.id",
    deleteRule: "@request.auth.id != \"\" && user.id = @request.auth.id",

    schema: [
      {
        name: "user",
        type: "relation",
        required: true,
        options: {
          collectionId: "pbc_1736455494", // users collection
          cascadeDelete: true,
          minSelect: null,
          maxSelect: 1,
          displayFields: []
        }
      },
      {
        name: "session_data",
        type: "text",
        required: true,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        name: "compressed",
        type: "bool",
        required: false,
        options: {}
      },
      {
        name: "phone_number",
        type: "text",
        required: false,
        options: {
          min: null,
          max: 20,
          pattern: "^[0-9]*$"
        }
      },
      {
        name: "last_active",
        type: "date",
        required: false,
        options: {
          min: "",
          max: ""
        }
      },
      {
        name: "size_bytes",
        type: "number",
        required: false,
        options: {
          min: null,
          max: null
        }
      },
      {
        name: "metadata",
        type: "json",
        required: false,
        options: {}
      }
    ],

    indexes: [
      "CREATE UNIQUE INDEX idx_user_whatsapp_sessions ON whatsapp_sessions (user)",
      "CREATE INDEX idx_last_active ON whatsapp_sessions (last_active)",
      "CREATE INDEX idx_phone_number ON whatsapp_sessions (phone_number)"
    ]
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_whatsapp_sessions");
  return dao.deleteCollection(collection);
});
