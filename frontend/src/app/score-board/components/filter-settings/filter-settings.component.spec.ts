import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { MatSelect } from '@angular/material/select'
import { MatOptgroup } from '@angular/material/core'
import { FilterSettingsComponent } from './filter-settings.component'
import { CategoryFilterComponent } from './components/category-filter/category-filter.component'
import { DEFAULT_FILTER_SETTING } from '../../filter-settings/FilterSetting'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatTooltipModule, MatTooltip } from '@angular/material/tooltip'
import { MatDialogModule, MatDialog } from '@angular/material/dialog'
import { DifficultySelectionSummaryPipe } from './pipes/difficulty-selection-summary.pipe'
import { LocalBackupService } from '../../../Services/local-backup.service'

describe('FilterSettingsComponent', () => {
    let component: FilterSettingsComponent
    let fixture: ComponentFixture<FilterSettingsComponent>
    let dialog: MatDialog
    let translateService: TranslateService

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatTooltipModule,
                MatDialogModule,
                FilterSettingsComponent,
                CategoryFilterComponent,
                DifficultySelectionSummaryPipe
            ],
            providers: [
                {
                    provide: LocalBackupService,
                    useValue: {
                        save: () => null,
                        restore: () => null
                    }
                }
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(FilterSettingsComponent)
        component = fixture.componentInstance
        dialog = TestBed.inject(MatDialog)
        translateService = TestBed.inject(TranslateService)
        translateService.use('en')

        component.allChallenges = []
        component.filterSetting = { ...DEFAULT_FILTER_SETTING }

        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should not be possible to reset filter when default filters are set', () => {
        component.filterSetting = { ...DEFAULT_FILTER_SETTING }
        expect(component.canBeReset()).toBe(false)
    })

    it('should be possible to reset difficulty filter', () => {
        component.filterSetting = { ...DEFAULT_FILTER_SETTING, difficulties: [1] }
        expect(component.canBeReset()).toBe(true)
    })

    it('should be possible to reset status filter', () => {
        component.filterSetting = { ...DEFAULT_FILTER_SETTING, status: 'unsolved' }
        expect(component.canBeReset()).toBe(true)
    })

    it('should be possible to reset tag filter', () => {
        component.filterSetting = { ...DEFAULT_FILTER_SETTING, tags: ['tag1'] }
        expect(component.canBeReset()).toBe(true)
    })

    it('should be possible to reset category filter', () => {
        component.filterSetting = { ...DEFAULT_FILTER_SETTING, categories: ['category1'] }
        expect(component.canBeReset()).toBe(true)
    })

    it('should be possible to reset search filter', () => {
        component.filterSetting = { ...DEFAULT_FILTER_SETTING, searchQuery: 'sqli' }
        expect(component.canBeReset()).toBe(true)
    })

    it('should be possible to reset filter for disabled challenges', () => {
        component.filterSetting = { ...DEFAULT_FILTER_SETTING, showDisabledChallenges: false }
        expect(component.canBeReset()).toBe(true)
    })

    it('should open additional settings dialog', () => {
        vi.spyOn(dialog, 'open')
        component.openAdditionalSettingsDialog()
        expect(dialog.open).toHaveBeenCalled()
    })

    it('should emit difficulty filter change', () => {
        vi.spyOn(component.filterSettingChange, 'emit')
        const difficulties = [1, 2, 3]
        component.onDifficultyFilterChange([1, 2, 3])
        expect(component.filterSettingChange.emit).toHaveBeenCalledWith(expect.objectContaining({ difficulties }))
    })

    it('should emit status filter change', () => {
        vi.spyOn(component.filterSettingChange, 'emit')
        const status = 'unsolved'
        component.onStatusFilterChange(status)
        expect(component.filterSettingChange.emit).toHaveBeenCalledWith(expect.objectContaining({ status }))
    })

    it('should emit tag filter change', () => {
        vi.spyOn(component.filterSettingChange, 'emit')
        const tags = ['tag1', 'tag2']
        component.onTagFilterChange(tags)
        expect(component.filterSettingChange.emit).toHaveBeenCalledWith(expect.objectContaining({ tags }))
    })

    it('should emit category filter change', () => {
        vi.spyOn(component.filterSettingChange, 'emit')
        const categories = ['category1', 'category2']
        component.onCategoryFilterChange(categories)
        expect(component.filterSettingChange.emit).toHaveBeenCalledWith(expect.objectContaining({ categories }))
    })

    it('should emit search query filter change', () => {
        vi.spyOn(component.filterSettingChange, 'emit')
        const searchQuery = 'query'
        component.onSearchQueryFilterChange(searchQuery)
        expect(component.filterSettingChange.emit).toHaveBeenCalledWith(expect.objectContaining({ searchQuery }))
    })

    it('should group "Requires ..." tags into a single "External Dependency" tag', () => {
        component.allChallenges = [
            { tagList: ['Requires SMTP', 'easy'], category: 'cat1' },
            { tagList: ['Requires OAuth'], category: 'cat1' },
            { tagList: ['hard'], category: 'cat2' }
        ] as any[]
        component.ngOnChanges()
        expect(component.tags).toContain(FilterSettingsComponent.EXTERNAL_DEPENDENCY_TAG)
        expect(component.tags).not.toContain('Requires SMTP')
        expect(component.tags).not.toContain('Requires OAuth')
        expect(component.tags).toContain('easy')
        expect(component.tags).toContain('hard')
    })

    it('should sort tags alphabetically', () => {
        component.allChallenges = [
            { tagList: ['Zebra', 'Apple'], category: 'cat1' },
            { tagList: ['Mango'], category: 'cat1' }
        ] as any[]
        component.ngOnChanges()
        expect(component.tags).toEqual(['Apple', 'Mango', 'Zebra'])
    })

    it('should sort tags alphabetically including External Dependency', () => {
        component.allChallenges = [
            { tagList: ['Zebra', 'Requires SMTP'], category: 'cat1' },
            { tagList: ['Apple'], category: 'cat1' }
        ] as any[]
        component.ngOnChanges()
        expect(component.tags).toEqual(['Apple', 'External Dependency', 'Zebra'])
    })

    it('should cluster tags into alphabetical groups with alphabetical tags within each group', () => {
        component.allChallenges = [
            { tagList: ['Web3', 'Danger Zone', 'OSINT'], category: 'cat1' },
            { tagList: ['Tutorial', 'Shenanigans', 'Code Analysis'], category: 'cat1' },
            { tagList: ['Requires SMTP', 'Contraption'], category: 'cat2' }
        ] as any[]
        component.ngOnChanges()
        expect(component.tagGroups).toEqual([
            { name: 'TAG_GROUP_CONSTRAINTS', tags: ['Danger Zone', 'External Dependency'] },
            { name: 'TAG_GROUP_FLAVOR', tags: ['Contraption', 'Shenanigans'] },
            { name: 'TAG_GROUP_LEARNING', tags: ['Tutorial'] },
            { name: 'TAG_GROUP_TECHNIQUE', tags: ['Code Analysis', 'OSINT'] },
            { name: 'TAG_GROUP_TECHNOLOGY', tags: ['Web3'] }
        ])
    })

    it('should put unknown tags into Other group sorted alphabetically', () => {
        component.allChallenges = [
            { tagList: ['Custom Tag B', 'Web3', 'Custom Tag A'], category: 'cat1' }
        ] as any[]
        component.ngOnChanges()
        expect(component.tagGroups).toEqual([
            { name: 'Other', tags: ['Custom Tag A', 'Custom Tag B'] },
            { name: 'TAG_GROUP_TECHNOLOGY', tags: ['Web3'] }
        ])
    })

    it('should translate tag options in the tags dropdown while maintaining raw tag values', () => {
        translateService.setTranslation('en', {
            TAG_DANGER_ZONE: 'Danger Zone Translated',
            TAG_OSINT: 'OSINT Translated'
        }, true)

        component.allChallenges = [
            { tagList: ['Danger Zone', 'OSINT'], category: 'cat1' }
        ] as any[]
        component.ngOnChanges()
        fixture.detectChanges()

        const selects = fixture.debugElement.queryAll(By.directive(MatSelect))
        const tagSelect = selects[2].componentInstance as MatSelect
        const options = tagSelect.options.toArray()
        const dangerZoneOption = options.find((opt) => opt.value === 'Danger Zone')
        const osintOption = options.find((opt) => opt.value === 'OSINT')

        expect(dangerZoneOption).toBeTruthy()
        expect(dangerZoneOption!.viewValue.trim()).toBe('Danger Zone Translated')
        expect(dangerZoneOption!.value).toBe('Danger Zone')

        expect(osintOption).toBeTruthy()
        expect(osintOption!.viewValue.trim()).toBe('OSINT Translated')
        expect(osintOption!.value).toBe('OSINT')
    })

    it('should translate External Dependency tag option with injected dependency translation', () => {
        translateService.setTranslation('en', {
            TAG_EXTERNAL_DEPENDENCY: 'Requires {{dependency}}',
            TAG_DEPENDENCY: 'Dependency'
        }, true)
        translateService.setTranslation('de', {
            TAG_EXTERNAL_DEPENDENCY: 'Erfordert {{dependency}}',
            TAG_DEPENDENCY: 'Abhängigkeit'
        }, true)

        component.allChallenges = [
            { tagList: ['Requires SMTP'], category: 'cat1' }
        ] as any[]
        component.ngOnChanges()
        fixture.detectChanges()

        const selects = fixture.debugElement.queryAll(By.directive(MatSelect))
        const tagSelect = selects[2].componentInstance as MatSelect
        let options = tagSelect.options.toArray()
        let externalDepOption = options.find((opt) => opt.value === 'External Dependency')

        expect(externalDepOption).toBeTruthy()
        expect(externalDepOption!.viewValue.trim()).toBe('Requires Dependency')
        expect(externalDepOption!.value).toBe('External Dependency')

        translateService.use('de')
        fixture.detectChanges()

        options = tagSelect.options.toArray()
        externalDepOption = options.find((opt) => opt.value === 'External Dependency')
        expect(externalDepOption).toBeTruthy()
        expect(externalDepOption!.viewValue.trim()).toBe('Erfordert Abhängigkeit')
        expect(externalDepOption!.value).toBe('External Dependency')
    })

    it('should attach tooltips with delay to tag options in the tags dropdown without group tooltips', () => {
        translateService.setTranslation('en', {
            TAG_DANGER_ZONE: 'Danger Zone',
            TAG_DANGER_ZONE_DESCRIPTION: 'Danger Zone Description'
        }, true)

        component.allChallenges = [
            { tagList: ['Danger Zone'], category: 'cat1' }
        ] as any[]
        component.ngOnChanges()
        fixture.detectChanges()

        const selects = fixture.debugElement.queryAll(By.directive(MatSelect))
        const tagSelect = selects[2].componentInstance as MatSelect
        tagSelect.open()
        fixture.detectChanges()

        const tooltips = fixture.debugElement.queryAll(By.directive(MatTooltip))
        const messages = tooltips.map((t) => t.injector.get(MatTooltip).message)
        expect(messages).toContain('Danger Zone Description')

        const optionTooltip = tooltips.find((t) => t.injector.get(MatTooltip).message === 'Danger Zone Description')
        expect(optionTooltip).toBeTruthy()
        expect(optionTooltip!.injector.get(MatTooltip).showDelay).toBe(500)

        const optgroups = tagSelect.optionGroups.toArray()
        expect(optgroups.length).toBe(1)
        const optgroupDebugEls = fixture.debugElement.queryAll(By.directive(MatOptgroup))
        for (const optgroupEl of optgroupDebugEls) {
            expect(optgroupEl.injector.get(MatTooltip, null)).toBeNull()
        }
    })

    it('should translate tag group labels in the tags dropdown', () => {
        translateService.setTranslation('en', {
            TAG_GROUP_CONSTRAINTS: 'Constraints English',
            TAG_GROUP_TECHNOLOGY: 'Technology English'
        }, true)
        translateService.setTranslation('de', {
            TAG_GROUP_CONSTRAINTS: 'Einschränkungen Deutsch',
            TAG_GROUP_TECHNOLOGY: 'Technologie Deutsch'
        }, true)

        component.allChallenges = [
            { tagList: ['Danger Zone', 'Web3'], category: 'cat1' }
        ] as any[]
        component.ngOnChanges()
        fixture.detectChanges()

        const selects = fixture.debugElement.queryAll(By.directive(MatSelect))
        const tagSelect = selects[2].componentInstance as MatSelect
        tagSelect.open()
        fixture.detectChanges()

        let optgroups = tagSelect.optionGroups.toArray()
        expect(optgroups.length).toBe(2)
        expect(optgroups[0].label).toBe('Constraints English')
        expect(optgroups[1].label).toBe('Technology English')

        translateService.use('de')
        fixture.detectChanges()

        optgroups = tagSelect.optionGroups.toArray()
        expect(optgroups[0].label).toBe('Einschränkungen Deutsch')
        expect(optgroups[1].label).toBe('Technologie Deutsch')
    })
})
