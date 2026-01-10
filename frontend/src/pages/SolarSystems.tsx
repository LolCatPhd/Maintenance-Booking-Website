import { useEffect, useState } from 'react';
import { solarSystemAPI } from '../services/api';

export default function SolarSystems() {
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSystem, setShowAddSystem] = useState(false);
  const [showAddComponent, setShowAddComponent] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    systemName: '',
    installationDate: '',
    address: '',
  });
  const [componentData, setComponentData] = useState({
    componentType: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    installDate: '',
    warrantyExpiry: '',
    notes: '',
  });

  useEffect(() => {
    loadSystems();
  }, []);

  const loadSystems = async () => {
    try {
      const response = await solarSystemAPI.getSystems();
      setSystems(response.data);
    } catch (error) {
      console.error('Failed to load systems', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await solarSystemAPI.createSystem(formData);
      setFormData({ systemName: '', installationDate: '', address: '' });
      setShowAddSystem(false);
      loadSystems();
    } catch (error) {
      alert('Failed to add system');
    }
  };

  const handleAddComponent = async (e: React.FormEvent, systemId: string) => {
    e.preventDefault();
    try {
      await solarSystemAPI.addComponent(systemId, componentData);
      setComponentData({
        componentType: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        installDate: '',
        warrantyExpiry: '',
        notes: '',
      });
      setShowAddComponent(null);
      loadSystems();
    } catch (error) {
      alert('Failed to add component');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Solar Systems</h1>
          <button
            onClick={() => setShowAddSystem(!showAddSystem)}
            className="btn-primary"
          >
            {showAddSystem ? 'Cancel' : 'Add System'}
          </button>
        </div>

        {showAddSystem && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">Add New Solar System</h2>
            <form onSubmit={handleAddSystem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.systemName}
                  onChange={(e) =>
                    setFormData({ ...formData, systemName: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Installation Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.installationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, installationDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <button type="submit" className="btn-primary">
                Add System
              </button>
            </form>
          </div>
        )}

        {systems.length > 0 ? (
          <div className="space-y-8">
            {systems.map((system) => (
              <div key={system.id} className="card">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {system.systemName}
                  </h2>
                  <p className="text-gray-600">{system.address}</p>
                  <p className="text-sm text-gray-500">
                    Installed: {new Date(system.installationDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Components</h3>
                    <button
                      onClick={() =>
                        setShowAddComponent(
                          showAddComponent === system.id ? null : system.id
                        )
                      }
                      className="btn-secondary text-sm"
                    >
                      {showAddComponent === system.id ? 'Cancel' : 'Add Component'}
                    </button>
                  </div>

                  {showAddComponent === system.id && (
                    <form
                      onSubmit={(e) => handleAddComponent(e, system.id)}
                      className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3"
                    >
                      <div className="grid md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Component Type (e.g., Panel, Inverter)"
                          value={componentData.componentType}
                          onChange={(e) =>
                            setComponentData({
                              ...componentData,
                              componentType: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Manufacturer"
                          value={componentData.manufacturer}
                          onChange={(e) =>
                            setComponentData({
                              ...componentData,
                              manufacturer: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Model"
                          value={componentData.model}
                          onChange={(e) =>
                            setComponentData({
                              ...componentData,
                              model: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                        <input
                          type="text"
                          placeholder="Serial Number"
                          value={componentData.serialNumber}
                          onChange={(e) =>
                            setComponentData({
                              ...componentData,
                              serialNumber: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                        <input
                          type="date"
                          required
                          placeholder="Install Date"
                          value={componentData.installDate}
                          onChange={(e) =>
                            setComponentData({
                              ...componentData,
                              installDate: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                        <input
                          type="date"
                          placeholder="Warranty Expiry"
                          value={componentData.warrantyExpiry}
                          onChange={(e) =>
                            setComponentData({
                              ...componentData,
                              warrantyExpiry: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <textarea
                        placeholder="Notes"
                        value={componentData.notes}
                        onChange={(e) =>
                          setComponentData({
                            ...componentData,
                            notes: e.target.value,
                          })
                        }
                        className="input-field"
                        rows={2}
                      />
                      <button type="submit" className="btn-primary text-sm">
                        Add Component
                      </button>
                    </form>
                  )}

                  {system.components.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {system.components.map((component: any) => (
                        <div
                          key={component.id}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <h4 className="font-bold text-lg">{component.componentType}</h4>
                          <p className="text-sm text-gray-600">
                            {component.manufacturer} - {component.model}
                          </p>
                          {component.serialNumber && (
                            <p className="text-xs text-gray-500">
                              S/N: {component.serialNumber}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Installed: {new Date(component.installDate).toLocaleDateString()}
                          </p>
                          {component.warrantyExpiry && (
                            <p className="text-xs text-gray-500">
                              Warranty: {new Date(component.warrantyExpiry).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No components added yet
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Maintenance History</h3>
                  {system.maintenanceVisits.length > 0 ? (
                    <div className="space-y-3">
                      {system.maintenanceVisits.map((visit: any) => (
                        <div key={visit.id} className="p-4 bg-blue-50 rounded-lg">
                          <p className="font-semibold">
                            {new Date(visit.visitDate).toLocaleDateString()}
                          </p>
                          {visit.technicianName && (
                            <p className="text-sm text-gray-600">
                              Technician: {visit.technicianName}
                            </p>
                          )}
                          {visit.findings && (
                            <p className="text-sm text-gray-600">
                              Findings: {visit.findings}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No maintenance visits yet
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No solar systems registered</p>
            <button onClick={() => setShowAddSystem(true)} className="btn-primary">
              Add Your First System
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
