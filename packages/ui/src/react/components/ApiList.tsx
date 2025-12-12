import React, { useEffect, useMemo, useState } from 'react';
import { Search, X, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRulesStore } from '@/stores/useRulesStore';
import type { ApiMeta } from '@error-mock/core';

const METHOD_COLORS: Record<string, string> = {
  GET: 'em:bg-blue-100 em:text-blue-800',
  POST: 'em:bg-green-100 em:text-green-800',
  PUT: 'em:bg-orange-100 em:text-orange-800',
  DELETE: 'em:bg-red-100 em:text-red-800',
  PATCH: 'em:bg-purple-100 em:text-purple-800',
};

const DEFAULT_METHOD_COLOR = 'em:bg-gray-100 em:text-gray-800';

export const ApiList: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedId,
    setSelectedId,
    mockRules,
    apiMetas,
  } = useRulesStore();

  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    return useRulesStore.getState().groupedMetas();
  }, [apiMetas, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('api-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleModule = (moduleName: string) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  };

  const getStatusColor = (id: string) => {
    const rule = mockRules.get(id);
    if (!rule || !rule.enabled || rule.mockType === 'none') {
      return 'em:bg-gray-300';
    }
    if (rule.mockType === 'success') {
      return 'em:bg-green-500';
    }
    return 'em:bg-red-500';
  };

  const sortedModules = useMemo(() => Array.from(groups.keys()).sort(), [groups]);

  return (
    <div className="em:flex em:h-full em:flex-col em:bg-white em:border-r em:border-gray-200">
      {/* Search Header */}
      <div className="em:p-4 em:border-b em:border-gray-200">
        <div className="em:relative">
          <Search className="em:absolute em:left-3 em:top-2.5 em:h-4 em:w-4 em:text-gray-400" />
          <input
            id="api-search-input"
            type="text"
            placeholder="Search APIs... (⌘K)"
            aria-label="Search APIs"
            className="em:h-9 em:w-full em:rounded-md em:border em:border-gray-200 em:bg-gray-50 em:pl-9 em:pr-8 em:text-sm em:outline-none focus:em:border-blue-500 focus:em:ring-1 focus:em:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="em:absolute em:right-2.5 em:top-2.5 em:text-gray-400 hover:em:text-gray-600"
              aria-label="Clear search"
              type="button"
            >
              <X className="em:h-4 em:w-4" />
            </button>
          )}
        </div>
      </div>

      {/* API List */}
      <div className="em:flex-1 em:overflow-y-auto">
        {sortedModules.length === 0 ? (
          <div className="em:flex em:flex-col em:items-center em:justify-center em:py-12 em:text-center em:text-gray-500">
            <Inbox className="em:h-12 em:w-12 em:mb-3 em:text-gray-300" />
            <p className="em:text-sm em:font-medium">No APIs found</p>
            <p className="em:text-xs em:mt-1">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="em:divide-y em:divide-gray-100">
            {sortedModules.map((moduleName) => {
              const moduleApis = groups.get(moduleName) || [];
              const isCollapsed = collapsedModules.has(moduleName);

              return (
                <div key={moduleName}>
                  <button
                    onClick={() => toggleModule(moduleName)}
                    className="em:flex em:w-full em:items-center em:justify-between em:bg-gray-50/50 em:px-4 em:py-2 em:text-xs em:font-semibold em:text-gray-500 hover:em:bg-gray-100"
                    type="button"
                    aria-expanded={!isCollapsed}
                  >
                    <div className="em:flex em:items-center em:gap-2">
                      <ChevronRight
                        className={cn(
                          'em:h-3.5 em:w-3.5 em:transition-transform',
                          !isCollapsed && 'em:rotate-90'
                        )}
                      />
                      <span className="em:uppercase em:tracking-wider">{moduleName}</span>
                    </div>
                    <span className="em:rounded-full em:bg-gray-200 em:px-1.5 em:py-0.5 em:text-[10px]">
                      {moduleApis.length}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div>
                      {moduleApis.map((api) => {
                        const id = `${api.module}-${api.name}`;
                        const isSelected = selectedId === id;

                        return (
                          <div
                            key={id}
                            onClick={() => setSelectedId(id)}
                            className={cn(
                              'em:group em:relative em:flex em:cursor-pointer em:items-center em:gap-3 em:px-4 em:py-3 em:transition-colors',
                              isSelected
                                ? 'em:bg-blue-50 em:ring-1 em:ring-blue-200 em:z-10'
                                : 'hover:em:bg-gray-50'
                            )}
                            role="button"
                            tabIndex={0}
                            aria-selected={isSelected}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedId(id);
                              }
                            }}
                          >
                            <span
                              className={cn(
                                'em:flex-shrink-0 em:rounded em:px-1.5 em:py-0.5 em:text-[10px] em:font-bold',
                                METHOD_COLORS[api.method.toUpperCase()] || DEFAULT_METHOD_COLOR
                              )}
                            >
                              {api.method.toUpperCase()}
                            </span>
                            <div className="em:min-w-0 em:flex-1">
                              <div className="em:flex em:items-center em:justify-between em:gap-2">
                                <p
                                  className={cn(
                                    'em:truncate em:text-sm em:font-medium',
                                    isSelected ? 'em:text-blue-900' : 'em:text-gray-900'
                                  )}
                                >
                                  {api.name}
                                </p>
                                <div
                                  className={cn(
                                    'em:h-2 em:w-2 em:flex-shrink-0 em:rounded-full',
                                    getStatusColor(id)
                                  )}
                                />
                              </div>
                              <p className="em:truncate em:text-xs em:text-gray-500">{api.url}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
