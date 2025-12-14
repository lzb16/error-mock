import React, { useEffect, useMemo, useState } from 'react';
import { Search, X, ChevronRight, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRulesStore } from '@/stores/useRulesStore';
import type { ApiMeta } from '@error-mock/core';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MethodBadge } from './MethodBadge';

export const ApiList: React.FC = () => {
  const { t } = useI18n();
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
    if (!rule || !rule.enabled) {
      return 'em:bg-gray-300';
    }
    return 'em:bg-green-500';
  };

  const sortedModules = useMemo(() => Array.from(groups.keys()).sort(), [groups]);

  return (
    <div className="em:flex em:h-full em:flex-col em:bg-white em:border-r em:border-gray-200">
      {/* Search Header */}
      <div className="em:p-3 em:border-b em:border-gray-200">
        <div className="em:relative">
          <Search className="em:absolute em:left-3 em:top-2.5 em:h-4 em:w-4 em:text-gray-400" />
          <Input
            id="api-search-input"
            type="text"
            placeholder={t('apiList.search.placeholder')}
            aria-label={t('apiList.search.ariaLabel')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="em:bg-gray-50 em:pl-9 em:pr-8"
          />
          {searchQuery && (
            <Button
              onClick={() => setSearchQuery('')}
              variant="ghost"
              size="icon-sm"
              className="em:absolute em:right-2 em:top-2"
              aria-label={t('apiList.search.clear')}
              type="button"
            >
              <X className="em:h-4 em:w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* API List */}
      <div className="em:flex-1 em:overflow-y-auto">
        {sortedModules.length === 0 ? (
          <div className="em:flex em:flex-col em:items-center em:justify-center em:py-12 em:text-center em:text-gray-500">
            <Inbox className="em:h-12 em:w-12 em:mb-3 em:text-gray-300" />
            <p className="em:text-sm em:font-medium">{t('apiList.empty.title')}</p>
            <p className="em:text-xs em:mt-1">{t('apiList.empty.subtitle')}</p>
          </div>
        ) : (
          <div className="em:divide-y em:divide-gray-100">
            {sortedModules.map((moduleName) => {
              const moduleApis = groups.get(moduleName) || [];
              const isCollapsed = collapsedModules.has(moduleName);

              return (
                <div key={moduleName}>
                  <Button
                    onClick={() => toggleModule(moduleName)}
                    variant="ghost"
                    size="sm"
                    className="em:flex em:w-full em:items-center em:justify-between em:bg-gray-50/50 em:px-4 em:py-2 em:text-xs em:font-semibold em:text-gray-500 hover:em:bg-gray-100 em:h-auto"
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
                    <Badge variant="secondary" className="em:text-[10px]">
                      {moduleApis.length}
                    </Badge>
                  </Button>

                  {!isCollapsed && (
                    <div>
                      {moduleApis.map((api) => {
                        const id = `${api.module}-${api.name}`;
                        const isSelected = selectedId === id;

                        return (
                          <Button
                            key={id}
                            onClick={() => setSelectedId(id)}
                            className={cn(
                              'em:group em:relative em:flex em:w-full em:items-center em:gap-3 em:px-4 em:py-2.5 em:transition-colors em:h-auto em:justify-start em:rounded-none',
                              isSelected
                                ? 'em:bg-blue-50 em:ring-1 em:ring-blue-200 em:z-10'
                                : 'hover:em:bg-gray-50'
                            )}
                            aria-selected={isSelected}
                            variant="ghost"
                            type="button"
                          >
                            <MethodBadge method={api.method} />
                            <div className="em:min-w-0 em:flex-1">
                              <div className="em:flex em:items-center em:justify-between em:gap-2">
                                <p
                                  className={cn(
                                    'em:truncate em:text-sm em:font-medium em:text-left',
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
                              <p className="em:truncate em:text-xs em:text-gray-500 em:text-left">{api.url}</p>
                            </div>
                          </Button>
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
